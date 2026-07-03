import { Router, type IRouter } from "express";
import { eq, and, desc, ne } from "drizzle-orm";
import { z } from "zod";
import { db, appointmentsTable, doctorsTable, usersTable, specialtiesTable, clinicsTable } from "@workspace/db";
import { sendAppointmentConfirmedEmail, sendAppointmentCancelledEmail } from "../lib/email";

const router: IRouter = Router();

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function serializeRow(r: typeof appointmentsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

/** Parses a "9:00 AM" / "14:30" style time string into minutes-since-midnight, or null if unparseable. */
function parseTimeToMinutes(time: string): number | null {
  const ampm = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const isPM = ampm[3].toUpperCase() === "PM";
    if (h === 12) h = 0;
    if (isPM) h += 12;
    return h * 60 + m;
  }
  const h24 = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    return parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10);
  }
  return null;
}

/** Returns true if `time` falls within an active window of `schedule` for the weekday of `dateStr` (YYYY-MM-DD). */
function isWithinSchedule(
  schedule: Record<string, { active?: boolean; from: string; to: string }>,
  dateStr: string,
  time: string,
): boolean {
  const dayKey = DAY_KEYS[new Date(dateStr + "T00:00:00Z").getUTCDay()];
  const window = schedule[dayKey];
  if (!window || window.active === false) return false;
  const t = parseTimeToMinutes(time);
  const from = parseTimeToMinutes(window.from);
  const to = parseTimeToMinutes(window.to);
  if (t === null || from === null || to === null) return false;
  return t >= from && t < to;
}

/* ─── POST /appointments ─── */
router.post("/appointments", async (req, res): Promise<void> => {
  const Schema = z.object({
    doctorId: z.coerce.number(),
    clinicId: z.coerce.number().optional().nullable(),
    patientUserId: z.coerce.number().optional().nullable(),
    patientName: z.string().min(1, "Patient name is required"),
    patientPhone: z.string().min(7, "Valid phone required"),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    appointmentTime: z.string().min(1, "Time is required"),
    notes: z.string().optional().nullable(),
  });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
    return;
  }

  const d = parsed.data;

  // ── Reject double-booking: same doctor/clinic/date/time already taken (not cancelled) ──
  const conflictConditions = [
    eq(appointmentsTable.doctorId, d.doctorId),
    eq(appointmentsTable.appointmentDate, d.appointmentDate),
    eq(appointmentsTable.appointmentTime, d.appointmentTime),
    ne(appointmentsTable.status, "cancelled"),
  ];
  if (d.clinicId) conflictConditions.push(eq(appointmentsTable.clinicId, d.clinicId));
  const [conflict] = await db.select({ id: appointmentsTable.id })
    .from(appointmentsTable)
    .where(and(...conflictConditions))
    .limit(1);
  if (conflict) {
    res.status(409).json({ error: "This time slot is no longer available" });
    return;
  }

  // ── Reject bookings outside the doctor/clinic's configured schedule, when one is configured ──
  let scheduleRaw: string | null = null;
  if (d.clinicId) {
    const [clinic] = await db.select({ schedule: clinicsTable.schedule })
      .from(clinicsTable).where(eq(clinicsTable.id, d.clinicId)).limit(1);
    scheduleRaw = clinic?.schedule ?? null;
  } else {
    const [doc] = await db.select({ schedule: doctorsTable.schedule })
      .from(doctorsTable).where(eq(doctorsTable.id, d.doctorId)).limit(1);
    scheduleRaw = doc?.schedule ?? null;
  }
  if (scheduleRaw) {
    try {
      const schedule = JSON.parse(scheduleRaw) as Record<string, { active?: boolean; from: string; to: string }>;
      if (!isWithinSchedule(schedule, d.appointmentDate, d.appointmentTime)) {
        res.status(400).json({ error: "This time is outside the doctor's available schedule" });
        return;
      }
    } catch { /* malformed schedule — fall through and allow booking */ }
  }

  // ── Follow-up detection + confirmation method ──
  let isFollowUp = false;
  let feeCharged: number | null = null;
  let initialStatus: typeof appointmentsTable.$inferSelect["status"] = "pending";

  if (d.clinicId) {
    const [clinic] = await db.select({
      fee: clinicsTable.fee,
      followUpDays: clinicsTable.followUpDays,
      followUpPrice: clinicsTable.followUpPrice,
      bookingConfirmationMethod: clinicsTable.bookingConfirmationMethod,
    }).from(clinicsTable).where(eq(clinicsTable.id, d.clinicId)).limit(1);

    if (clinic) {
      feeCharged = clinic.fee ?? null;

      // Set initial status based on confirmation method
      initialStatus = clinic.bookingConfirmationMethod === "manual"
        ? "pending_confirmation"
        : "confirmed";

      // Follow-up detection
      const followUpDays = clinic.followUpDays ?? 15;
      const cutoff = new Date(d.appointmentDate);
      cutoff.setDate(cutoff.getDate() - followUpDays);
      const cutoffStr = cutoff.toISOString().split("T")[0];

      const [lastVisit] = await db.select({ appointmentDate: appointmentsTable.appointmentDate })
        .from(appointmentsTable)
        .where(and(
          eq(appointmentsTable.doctorId, d.doctorId),
          eq(appointmentsTable.patientPhone, d.patientPhone),
          eq(appointmentsTable.status, "completed"),
        ))
        .orderBy(desc(appointmentsTable.appointmentDate))
        .limit(1);

      if (lastVisit && String(lastVisit.appointmentDate) >= cutoffStr) {
        isFollowUp = true;
        feeCharged = clinic.followUpPrice ?? 0;
      }
    }
  }

  const [appointment] = await db.insert(appointmentsTable).values({
    doctorId: d.doctorId,
    clinicId: d.clinicId ?? null,
    patientUserId: d.patientUserId ?? null,
    patientName: d.patientName,
    patientPhone: d.patientPhone,
    appointmentDate: d.appointmentDate,
    appointmentTime: d.appointmentTime,
    notes: d.notes ?? null,
    status: initialStatus,
    isFollowUp,
    feeCharged,
  }).returning();

  res.status(201).json(serializeRow(appointment));
});

/* ─── GET /appointments ─── */
router.get("/appointments", async (req, res): Promise<void> => {
  const Schema = z.object({
    doctorId: z.coerce.number().optional(),
    clinicId: z.coerce.number().optional(),
    patientUserId: z.coerce.number().optional(),
    patientPhone: z.string().optional(),
  });

  const params = Schema.safeParse(req.query);
  const { doctorId, clinicId, patientUserId, patientPhone } = params.success ? params.data : {};

  const conditions = [];
  if (doctorId) conditions.push(eq(appointmentsTable.doctorId, doctorId));
  if (clinicId) conditions.push(eq(appointmentsTable.clinicId, clinicId));
  if (patientUserId) conditions.push(eq(appointmentsTable.patientUserId, patientUserId));
  if (patientPhone) conditions.push(eq(appointmentsTable.patientPhone, patientPhone));

  const query = db
    .select({
      id: appointmentsTable.id,
      doctorId: appointmentsTable.doctorId,
      clinicId: appointmentsTable.clinicId,
      patientUserId: appointmentsTable.patientUserId,
      patientName: appointmentsTable.patientName,
      patientPhone: appointmentsTable.patientPhone,
      appointmentDate: appointmentsTable.appointmentDate,
      appointmentTime: appointmentsTable.appointmentTime,
      status: appointmentsTable.status,
      notes: appointmentsTable.notes,
      isFollowUp: appointmentsTable.isFollowUp,
      feeCharged: appointmentsTable.feeCharged,
      createdAt: appointmentsTable.createdAt,
      updatedAt: appointmentsTable.updatedAt,
      doctorName: usersTable.name,
      specialty: specialtiesTable.name,
      specialtyAr: specialtiesTable.nameAr,
    })
    .from(appointmentsTable)
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
    .leftJoin(specialtiesTable, eq(doctorsTable.specialtyId, specialtiesTable.id));

  const rows = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  res.json(rows.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  })));
});

/* ─── PATCH /appointments/:id ─── (update date/time) */
router.patch("/appointments/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const Schema = z.object({
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
    appointmentTime: z.string().min(1).optional(),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" }); return; }

  const update: Record<string, unknown> = {};
  if (parsed.data.appointmentDate) update.appointmentDate = parsed.data.appointmentDate;
  if (parsed.data.appointmentTime) update.appointmentTime = parsed.data.appointmentTime;

  if (Object.keys(update).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }

  const [row] = await db.update(appointmentsTable)
    .set(update)
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(serializeRow(row));
});

/* ─── PATCH /appointments/:id/status ─── */
router.patch("/appointments/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const Schema = z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "pending_confirmation"]),
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [row] = await db.update(appointmentsTable)
    .set({ status: parsed.data.status })
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  // ── Send email on confirmed or cancelled ──
  const newStatus = parsed.data.status;
  if ((newStatus === "confirmed" || newStatus === "cancelled") && row.patientUserId) {
    const [patient] = await db.select({
      email: usersTable.email,
      name: usersTable.name,
      notifyViaEmail: usersTable.notifyViaEmail,
      notificationLanguage: usersTable.notificationLanguage,
    }).from(usersTable).where(eq(usersTable.id, row.patientUserId)).limit(1);

    if (patient?.email && patient.notifyViaEmail !== false) {
      const [doctor] = await db.select({ name: usersTable.name })
        .from(doctorsTable)
        .leftJoin(usersTable, eq(doctorsTable.userId, usersTable.id))
        .where(eq(doctorsTable.id, row.doctorId))
        .limit(1);

      let clinicName: string | undefined;
      if (row.clinicId) {
        const [clinic] = await db.select({ nameEn: clinicsTable.nameEn })
          .from(clinicsTable).where(eq(clinicsTable.id, row.clinicId)).limit(1);
        clinicName = clinic?.nameEn ?? undefined;
      }

      const emailPayload = {
        to: patient.email,
        patientName: patient.name ?? row.patientName,
        doctorName: doctor?.name ?? "Doctor",
        date: String(row.appointmentDate),
        time: row.appointmentTime,
        clinicName,
        lang: (patient.notificationLanguage ?? "ar") as "en" | "ar",
      };

      if (newStatus === "confirmed") {
        await sendAppointmentConfirmedEmail(emailPayload);
      } else {
        await sendAppointmentCancelledEmail(emailPayload);
      }
    }
  }

  res.json(serializeRow(row));
});

export default router;
