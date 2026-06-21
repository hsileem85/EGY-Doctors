import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db, appointmentsTable, doctorsTable, usersTable, specialtiesTable, clinicsTable } from "@workspace/db";

const router: IRouter = Router();

function serializeRow(r: typeof appointmentsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
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

  // ── Follow-up detection ──
  let isFollowUp = false;
  let feeCharged: number | null = null;

  if (d.clinicId) {
    const [clinic] = await db.select({ fee: clinicsTable.fee, followUpDays: clinicsTable.followUpDays })
      .from(clinicsTable).where(eq(clinicsTable.id, d.clinicId)).limit(1);

    if (clinic) {
      feeCharged = clinic.fee ?? null;

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
        feeCharged = 0;
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

/* ─── PATCH /appointments/:id/status ─── */
router.patch("/appointments/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const Schema = z.object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
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

  res.json(serializeRow(row));
});

export default router;
