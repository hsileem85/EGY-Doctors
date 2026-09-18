import { Router, type IRouter } from "express";
import { eq, and, desc, ne, inArray, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, appointmentsTable, appointmentReminderDeliveriesTable, doctorsTable, usersTable, specialtiesTable, clinicsTable, medicalCentersTable, siteSettingsTable, paymentsTable, walletsTable, walletTransactionsTable, type WalletOwnerType } from "@workspace/db";
import { sendAppointmentConfirmedEmail, sendAppointmentCancelledEmail } from "../lib/email";
import {
  releaseBookingEscrowInTx,
  escrowBookingInTx,
  refundBookingEscrowInTx,
} from "../lib/wallet.service.js";
import { dispatchPaymobRefund } from "../lib/paymob.service.js";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { buildStripeBookingCheckoutForm, stripeBookingIdempotencyKey } from "../lib/stripeBooking.js";
import appointmentsSlotsRouter from "./appointments-slots";

const router: IRouter = Router();
const connectors = new ReplitConnectors();
router.use(appointmentsSlotsRouter);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";

function decodeJwt(authHeader: string | undefined): { sub: number; role: string } | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as { sub: number; role: string };
  } catch {
    return null;
  }
}

async function getBookingCommissionRate(
  executor: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<number> {
  const [setting] = await executor.select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "booking_commission_rate"))
    .limit(1);
  const configured = Number(setting?.value ?? 0.1);
  if (!Number.isFinite(configured) || configured < 0) return 0.1;
  return configured > 1 ? Math.min(configured / 100, 1) : Math.min(configured, 1);
}

const DAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Normalizes a schedule object's day keys to canonical casing ("Mon", "SAT", "tue" -> "Sun".."Sat"),
 * so schedules saved with different key casing (e.g. affiliated-doctor form using "MON") still resolve. */
function normalizeScheduleKeys<T>(schedule: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, val] of Object.entries(schedule)) {
    const canonical = DAY_KEYS.find((d) => d.toLowerCase() === key.trim().slice(0, 3).toLowerCase());
    if (canonical) out[canonical] = val;
  }
  return out;
}

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

const AVAILABILITY_PERIOD_DAYS: Record<string, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

/** Returns true if `dateStr` (YYYY-MM-DD) falls within the configured availability window, defaulting to a 30-day horizon. */
function isWithinAvailabilityWindow(
  dateStr: string,
  availabilityPeriod: string | null,
  availabilityFrom: string | null,
  availabilityTo: string | null,
): boolean {
  if (availabilityPeriod === "custom" && availabilityFrom && availabilityTo) {
    return dateStr >= availabilityFrom && dateStr <= availabilityTo;
  }
  const horizonDays = (availabilityPeriod && AVAILABILITY_PERIOD_DAYS[availabilityPeriod]) || 30;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00Z");
  const maxDate = new Date(today);
  maxDate.setUTCDate(maxDate.getUTCDate() + horizonDays);
  return target >= today && target <= maxDate;
}

/* ─── POST /appointments ─── */
router.post("/appointments", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "patient" || !Number.isSafeInteger(payload.sub) || payload.sub <= 0) {
    res.status(401).json({ error: "Sign in as a patient to book an appointment" });
    return;
  }
  const [caller] = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    phone: usersTable.phone,
    role: usersTable.role,
    isActive: usersTable.isActive,
  }).from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1);
  if (!caller || !caller.isActive || caller.role !== "patient") {
    res.status(403).json({ error: "Patient account is not active" });
    return;
  }
  const Schema = z.object({
    doctorId: z.coerce.number(),
    clinicId: z.coerce.number().optional().nullable(),
    patientUserId: z.coerce.number().optional().nullable(),
    // Patient identity is always replaced from the authenticated account below.
    patientName: z.string().optional(),
    patientPhone: z.string().optional(),
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
  d.patientUserId = caller.id;
  d.patientName = caller.name ?? "Patient";
  if (!caller.phone || caller.phone.length < 7) {
    res.status(400).json({ error: "Please add a valid phone number to your account before booking" });
    return;
  }
  d.patientPhone = caller.phone;

  // A virtual clinic id (-1) is a UI sentinel, not a database clinic. Resolve
  // the doctor's canonical clinic so fee, payment methods, and escrow ownership
  // are always server-owned and never silently become a free appointment.
  if (!d.clinicId || d.clinicId <= 0) {
    const [canonicalClinic] = await db.select({ id: clinicsTable.id })
      .from(clinicsTable)
      .where(eq(clinicsTable.doctorId, d.doctorId))
      .orderBy(clinicsTable.id)
      .limit(1);
    if (canonicalClinic) d.clinicId = canonicalClinic.id;
  } else {
    const [ownedClinic] = await db.select({ id: clinicsTable.id })
      .from(clinicsTable)
      .where(and(eq(clinicsTable.id, d.clinicId), eq(clinicsTable.doctorId, d.doctorId)))
      .limit(1);
    if (!ownedClinic) {
      res.status(400).json({ error: "Selected clinic is not available for this doctor" });
      return;
    }
  }

  // Release abandoned online bookings before checking the slot. This prevents
  // a failed/closed checkout from holding a slot forever.
  const [expirySetting] = await db.select({ value: siteSettingsTable.value })
    .from(siteSettingsTable).where(eq(siteSettingsTable.key, "pending_payment_expiry_minutes")).limit(1);
  const expiryMinutes = Number(expirySetting?.value);
  const pendingCutoff = new Date(Date.now() - (Number.isFinite(expiryMinutes) && expiryMinutes > 0 ? expiryMinutes : 30) * 60_000);
  const stale = await db.select({ appointmentId: appointmentsTable.id, paymentId: paymentsTable.id })
    .from(appointmentsTable)
    .innerJoin(paymentsTable, eq(paymentsTable.appointmentId, appointmentsTable.id))
    .where(and(
      eq(appointmentsTable.doctorId, d.doctorId),
      eq(appointmentsTable.appointmentDate, d.appointmentDate),
      eq(appointmentsTable.appointmentTime, d.appointmentTime),
       inArray(paymentsTable.status, ["PENDING", "FAILED"]),
      // Payment creation is the authoritative checkout age.
      sql`${paymentsTable.createdAt} < ${pendingCutoff}`,
    ));
  if (stale.length) {
    await db.transaction(async (tx) => {
      for (const row of stale) {
        const [bound] = await tx.select({ paymobOrderId: paymentsTable.paymobOrderId })
          .from(paymentsTable).where(eq(paymentsTable.id, row.paymentId)).limit(1);
        // A Stripe checkout can complete after a lost redirect. Never release its
        // reservation based only on age; reconciliation must inspect Stripe first.
        if (bound?.paymobOrderId?.startsWith("stripe:")) {
          let sessionId = bound.paymobOrderId.slice("stripe:".length);
          let currentBoundReference = bound.paymobOrderId;
          try {
            if (sessionId.startsWith("pending:")) {
              const [appointment] = await tx.select().from(appointmentsTable)
                .where(eq(appointmentsTable.id, row.appointmentId)).limit(1);
              if (!appointment?.feeCharged || appointment.feeCharged <= 0 || !appointment.patientUserId) continue;
              const origin = process.env.APP_URL?.replace(/\/+$/, "");
              if (!origin) continue;
              const response = await connectors.proxy("stripe", "/v1/checkout/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": stripeBookingIdempotencyKey(row.paymentId, bound.paymobOrderId) },
                body: buildStripeBookingCheckoutForm({ origin, appointmentId: row.appointmentId, paymentId: row.paymentId, amount: appointment.feeCharged, patientUserId: appointment.patientUserId }),
              });
              if (!response.ok) continue;
              const created = await response.json() as { id?: string };
              if (!created.id) continue;
              sessionId = created.id;
              currentBoundReference = `stripe:${sessionId}`;
              await tx.update(paymentsTable).set({ paymobOrderId: currentBoundReference })
                .where(and(eq(paymentsTable.id, row.paymentId), eq(paymentsTable.paymobOrderId, bound.paymobOrderId)));
            }
            const response = await connectors.proxy("stripe", `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
            const session = await response.json() as { payment_status?: string; payment_intent?: string | null };
            if (response.ok && session.payment_status === "paid") {
              const [boundPayment] = await tx.select().from(paymentsTable)
                .where(and(eq(paymentsTable.id, row.paymentId), eq(paymentsTable.paymobOrderId, currentBoundReference),
                  inArray(paymentsTable.status, ["PENDING", "FAILED"]))).limit(1);
              if (boundPayment) {
                const [appointment] = await tx.select().from(appointmentsTable)
                  .where(eq(appointmentsTable.id, row.appointmentId)).limit(1);
                if (appointment?.status === "cancelled") {
                  const intent = session.payment_intent;
                  if (!intent) continue;
                   const refund = await connectors.proxy("stripe", "/v1/refunds", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `booking-refund:${row.paymentId}` },
                    body: new URLSearchParams({ payment_intent: intent }),
                  });
                   const refundBody = await refund.json().catch(() => ({})) as { status?: string };
                   if (!refund.ok || refundBody.status !== "succeeded") continue;
                   const [refunded] = await tx.update(paymentsTable).set({ status: "REFUNDED", paymobTransactionId: intent })
                     .where(and(eq(paymentsTable.id, row.paymentId), inArray(paymentsTable.status, ["PENDING", "FAILED"]))).returning();
                  if (refunded && refunded.cashbackAmount > 0 && appointment.patientUserId) {
                    const [wallet] = await tx.update(walletsTable).set({
                      balance: sql`${walletsTable.balance} + ${refunded.cashbackAmount}`, updatedAt: new Date(),
                    }).where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(appointment.patientUserId)))).returning();
                    if (wallet) await tx.insert(walletTransactionsTable).values({
                      walletId: wallet.id, type: "CREDIT", category: "CASHBACK_REWARD",
                      amount: refunded.cashbackAmount, balancePost: wallet.balance,
                      referenceId: String(refunded.id), description: "Cashback restored after Stripe refund",
                    });
                  }
                  continue;
                }
                await tx.update(paymentsTable).set({
                  status: "PAID", paidAt: new Date(), escrowedAt: new Date(),
                  paymobTransactionId: session.payment_intent ?? null,
                }).where(and(eq(paymentsTable.id, row.paymentId), inArray(paymentsTable.status, ["PENDING", "FAILED"])));
                if (boundPayment.escrowOwnerType && boundPayment.escrowOwnerId) {
                  await escrowBookingInTx(tx, {
                    ownerType: boundPayment.escrowOwnerType as WalletOwnerType,
                    ownerId: boundPayment.escrowOwnerId,
                    amount: Number(boundPayment.amount) + Number(boundPayment.cashbackAmount ?? 0),
                    bookingId: String(row.appointmentId),
                  });
                  if (appointment?.status === "completed") {
                    const [settled] = await tx.update(paymentsTable).set({ status: "SETTLED" })
                      .where(and(eq(paymentsTable.id, row.paymentId), eq(paymentsTable.status, "PAID"))).returning();
                    if (settled) await releaseBookingEscrowInTx(tx, {
                      ownerType: boundPayment.escrowOwnerType as WalletOwnerType,
                      ownerId: boundPayment.escrowOwnerId,
                      amount: Number(boundPayment.amount) + Number(boundPayment.cashbackAmount ?? 0),
                      bookingId: String(row.appointmentId),
                      commissionRate: await getBookingCommissionRate(tx),
                      patientUserId: appointment.patientUserId ? String(appointment.patientUserId) : null,
                    });
                  }
                }
              }
              continue;
            }
          } catch {
            // Fail closed: an unavailable gateway cannot prove an unpaid session.
            continue;
          }
        }
        await tx.update(paymentsTable).set({ status: "FAILED" })
          .where(and(eq(paymentsTable.id, row.paymentId), eq(paymentsTable.status, "PENDING")));
        await tx.update(appointmentsTable).set({ status: "cancelled" })
          .where(and(eq(appointmentsTable.id, row.appointmentId), ne(appointmentsTable.status, "cancelled")));
      }
    });
  }

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
  // Prefer the clinic's own schedule/availability settings; if the clinic has
  // none configured (e.g. a medical-center-affiliated doctor's auto-created
  // clinic), fall back to the doctor-level values so bookings are still
  // validated correctly.
  let scheduleRaw: string | null = null;
  let availabilityPeriod: string | null = null;
  let availabilityFrom: string | null = null;
  let availabilityTo: string | null = null;
  if (d.clinicId) {
    const [clinic] = await db.select({
      schedule: clinicsTable.schedule,
      availabilityPeriod: clinicsTable.availabilityPeriod,
      availabilityFrom: clinicsTable.availabilityFrom,
      availabilityTo: clinicsTable.availabilityTo,
    }).from(clinicsTable).where(eq(clinicsTable.id, d.clinicId)).limit(1);
    scheduleRaw = clinic?.schedule ?? null;
    availabilityPeriod = clinic?.availabilityPeriod ?? null;
    availabilityFrom = clinic?.availabilityFrom ?? null;
    availabilityTo = clinic?.availabilityTo ?? null;
  }
  if (!scheduleRaw) {
    const [doc] = await db.select({
      schedule: doctorsTable.schedule,
      availabilityPeriod: doctorsTable.availabilityPeriod,
      availabilityFrom: doctorsTable.availabilityFrom,
      availabilityTo: doctorsTable.availabilityTo,
    }).from(doctorsTable).where(eq(doctorsTable.id, d.doctorId)).limit(1);
    scheduleRaw = doc?.schedule ?? null;
    availabilityPeriod = availabilityPeriod ?? doc?.availabilityPeriod ?? null;
    availabilityFrom = availabilityFrom ?? doc?.availabilityFrom ?? null;
    availabilityTo = availabilityTo ?? doc?.availabilityTo ?? null;
  }
  if (!isWithinAvailabilityWindow(d.appointmentDate, availabilityPeriod, availabilityFrom, availabilityTo)) {
    res.status(400).json({ error: "This date is outside the doctor's available booking window" });
    return;
  }
  if (scheduleRaw) {
    try {
      const rawSchedule = JSON.parse(scheduleRaw) as Record<string, { active?: boolean; from: string; to: string }>;
      const schedule = normalizeScheduleKeys(rawSchedule);
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
      if (clinic.fee != null) {
        feeCharged = clinic.fee;
      } else {
        const [doctorFee] = await db.select({ fee: doctorsTable.fee })
          .from(doctorsTable).where(eq(doctorsTable.id, d.doctorId)).limit(1);
        feeCharged = doctorFee?.fee ?? null;
      }

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
  } else {
    // Legacy affiliated doctors may not yet have an auto-created clinic.
    // Preserve the doctor's configured consultation fee rather than creating
    // a zero-fee appointment.
    const [doctor] = await db.select({ fee: doctorsTable.fee })
      .from(doctorsTable).where(eq(doctorsTable.id, d.doctorId)).limit(1);
    feeCharged = doctor?.fee ?? null;
    initialStatus = "confirmed";
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
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !Number.isSafeInteger(payload.sub) || payload.sub <= 0) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const Schema = z.object({
    doctorId: z.coerce.number().int().positive().optional(),
    clinicId: z.coerce.number().int().positive().optional(),
    patientUserId: z.coerce.number().int().positive().optional(),
    patientPhone: z.string().optional(),
  });

  const params = Schema.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "Invalid appointment filters" });
    return;
  }
  const { doctorId, clinicId, patientUserId, patientPhone } = params.data;

  const conditions = [];
  // Resolve the current account from the database: token claims and query
  // selectors must never grant access or keep a revoked assignment alive.
  const [caller] = await db.select().from(usersTable)
    .where(eq(usersTable.id, payload.sub)).limit(1);
  if (!caller?.isActive || caller.role !== payload.role) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  switch (caller.role) {
    case "patient":
      conditions.push(eq(appointmentsTable.patientUserId, caller.id));
      break;
    case "doctor":
      conditions.push(inArray(appointmentsTable.doctorId,
        db.select({ id: doctorsTable.id }).from(doctorsTable)
          .where(eq(doctorsTable.userId, caller.id))));
      break;
    case "medical_center":
      conditions.push(inArray(appointmentsTable.doctorId,
        db.select({ id: doctorsTable.id }).from(doctorsTable)
          .innerJoin(medicalCentersTable, eq(doctorsTable.affiliatedCenterId, medicalCentersTable.id))
          .where(eq(medicalCentersTable.userId, caller.id))));
      break;
    case "assistant":
      if (!caller.assistantDoctorId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      conditions.push(eq(appointmentsTable.doctorId, caller.assistantDoctorId));
      if (caller.assistantClinicId) {
        conditions.push(eq(appointmentsTable.clinicId, caller.assistantClinicId));
      }
      break;
    case "admin":
      break;
    default:
      res.status(403).json({ error: "Forbidden" });
      return;
  }
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
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "patient") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
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

  const row = await db.transaction(async (tx) => {
    const [updated] = await tx.update(appointmentsTable)
      .set(update)
      .where(and(
        eq(appointmentsTable.id, id),
        eq(appointmentsTable.patientUserId, payload.sub),
        ne(appointmentsTable.status, "cancelled"),
        ne(appointmentsTable.status, "completed"),
      ))
      .returning();
    if (updated) {
      await tx.delete(appointmentReminderDeliveriesTable)
        .where(eq(appointmentReminderDeliveriesTable.appointmentId, id));
    }
    return updated;
  });

  if (!row) { res.status(404).json({ error: "Appointment not found" }); return; }
  res.json(serializeRow(row));
});

/* ─── PATCH /appointments/:id/status ─── */
router.patch("/appointments/:id/status", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
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

  let refundPaymentId: number | null = null;
  const row = await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(appointmentsTable)
      .where(eq(appointmentsTable.id, id)).limit(1);
    if (!existing) return undefined;

    const [doctor] = await tx.select({
      userId: doctorsTable.userId,
      affiliatedCenterId: doctorsTable.affiliatedCenterId,
    }).from(doctorsTable).where(eq(doctorsTable.id, existing.doctorId)).limit(1);
    const [center] = doctor?.affiliatedCenterId
      ? await tx.select({ userId: medicalCentersTable.userId })
        .from(medicalCentersTable)
        .where(eq(medicalCentersTable.id, doctor.affiliatedCenterId))
        .limit(1)
      : [];
    const isProvider = (payload.role === "doctor" && doctor?.userId === payload.sub)
      || (payload.role === "medical_center" && center?.userId === payload.sub)
      || payload.role === "admin";
    const [assistant] = payload.role === "assistant"
      ? await tx.select({
        assistantDoctorId: usersTable.assistantDoctorId,
        assistantClinicId: usersTable.assistantClinicId,
        isActive: usersTable.isActive,
      }).from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1)
      : [];
    const isScopedAssistant = payload.role === "assistant"
      && assistant?.isActive === true
      && assistant.assistantDoctorId === existing.doctorId
      && (!assistant.assistantClinicId || assistant.assistantClinicId === existing.clinicId);
    const isAssistantCompletion = isScopedAssistant && parsed.data.status === "completed";
    const isPatientCancellation = payload.role === "patient"
      && existing.patientUserId === payload.sub
      && parsed.data.status === "cancelled";
    if (!isProvider && !isPatientCancellation && !isAssistantCompletion) {
      throw new Error("FORBIDDEN_APPOINTMENT_STATUS");
    }

    if (existing.status === parsed.data.status) {
      if (parsed.data.status === "cancelled") {
        const [pendingRefund] = await tx.select({ id: paymentsTable.id })
          .from(paymentsTable)
          .where(and(
            eq(paymentsTable.appointmentId, existing.id),
            eq(paymentsTable.status, "REFUND_PENDING"),
          ))
          .limit(1);
        refundPaymentId = pendingRefund?.id ?? null;
      }
      return existing;
    }
    if (existing.status === "completed" || existing.status === "cancelled") {
      return existing;
    }

    const [updated] = await tx.update(appointmentsTable)
      .set({ status: parsed.data.status, ...(parsed.data.status === "completed" ? { completedAt: new Date() } : {}) })
      .where(and(eq(appointmentsTable.id, id), eq(appointmentsTable.status, existing.status)))
      .returning();
    if (!updated) {
      const [current] = await tx.select().from(appointmentsTable)
        .where(eq(appointmentsTable.id, id)).limit(1);
      return current;
    }

    if (existing.feeCharged && existing.feeCharged > 0) {
      if (parsed.data.status === "cancelled") {
        const [pending] = await tx.select().from(paymentsTable)
          .where(and(eq(paymentsTable.appointmentId, existing.id), eq(paymentsTable.status, "PENDING"))).limit(1);
        if (pending) {
          await tx.update(paymentsTable).set({ status: "FAILED" })
            .where(and(eq(paymentsTable.id, pending.id), eq(paymentsTable.status, "PENDING")));
        }
      }
      const [payment] = await tx.select().from(paymentsTable)
        .where(and(
          eq(paymentsTable.appointmentId, existing.id),
          eq(paymentsTable.status, "PAID"),
        ))
        .limit(1);
      const owner = payment?.escrowOwnerType && payment.escrowOwnerId
        ? {
            ownerType: payment.escrowOwnerType as WalletOwnerType,
            ownerId: payment.escrowOwnerId,
          }
        : null;
      if (!owner) return updated;
      if (parsed.data.status === "completed") {
        const [settledPayment] = await tx.update(paymentsTable)
          .set({ status: "SETTLED" })
          .where(and(eq(paymentsTable.id, payment.id), eq(paymentsTable.status, "PAID")))
          .returning();
        if (settledPayment) {
          await releaseBookingEscrowInTx(tx, {
            ...owner,
            amount: existing.feeCharged,
            bookingId: String(existing.id),
            commissionRate: await getBookingCommissionRate(tx),
             patientUserId: existing.patientUserId ? String(existing.patientUserId) : null,
          });
        }
      } else if (parsed.data.status === "cancelled") {
        const [refundedPayment] = await tx.update(paymentsTable)
          .set({ status: "REFUND_PENDING" })
          .where(and(eq(paymentsTable.id, payment.id), eq(paymentsTable.status, "PAID")))
          .returning();
        if (!refundedPayment) throw new Error("Booking refund is already being processed");
        refundPaymentId = refundedPayment.id;
      }
    }
    return updated;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "FORBIDDEN_APPOINTMENT_STATUS") return "FORBIDDEN" as const;
    throw error;
  });

  if (row === "FORBIDDEN") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (!row) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (refundPaymentId !== null) {
    try {
      const [payment] = await db.select({
        paymobOrderId: paymentsTable.paymobOrderId,
        paymentIntent: paymentsTable.paymobTransactionId,
      }).from(paymentsTable).where(eq(paymentsTable.id, refundPaymentId)).limit(1);
      if (payment?.paymobOrderId?.startsWith("stripe:")) {
        if (!payment.paymentIntent) throw new Error("Stripe payment intent is missing");
        const refund = await connectors.proxy("stripe", "/v1/refunds", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": `booking-refund:${refundPaymentId}` },
          body: new URLSearchParams({ payment_intent: payment.paymentIntent }),
        });
        const refundBody = await refund.json().catch(() => ({})) as { status?: string };
        if (!refund.ok || refundBody.status !== "succeeded") {
          throw new Error(`Stripe refund is ${refundBody.status ?? `unavailable (${refund.status})`}`);
        }
        await db.transaction(async (tx) => {
          const [refunded] = await tx.update(paymentsTable).set({ status: "REFUNDED" })
            .where(and(eq(paymentsTable.id, refundPaymentId!), eq(paymentsTable.status, "REFUND_PENDING"))).returning();
          if (refunded?.escrowOwnerType && refunded.escrowOwnerId) {
            await refundBookingEscrowInTx(tx, {
              ownerType: refunded.escrowOwnerType as WalletOwnerType,
              ownerId: refunded.escrowOwnerId,
              amount: Number(refunded.amount) + Number(refunded.cashbackAmount ?? 0),
              bookingId: String(id),
            });
          }
        });
      } else {
        await dispatchPaymobRefund(refundPaymentId);
      }
    } catch (error) {
      req.log.error({ error, paymentId: refundPaymentId }, "Failed to request Paymob booking refund");
      res.status(502).json({ error: "Refund request is pending. Please try again." });
      return;
    }
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
