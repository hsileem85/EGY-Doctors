import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { eq, inArray, and, desc, or, ne, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
  db, doctorsTable, medicalCentersTable, usersTable,
  siteSettingsTable, vouchersTable, paymentsTable,
  appointmentsTable, clinicsTable, walletsTable, walletTransactionsTable,
  systemSettingsTable, type WalletOwnerType,
} from "@workspace/db";
import { logger } from "../lib/logger";
import { sendReceiptEmail } from "../lib/email";
import {
  recordSubscriptionFeeInTx,
  recordSubscriptionRefundInTx,
  centerSubtypeToWalletOwnerType,
  escrowBookingInTx,
  refundBookingEscrowInTx,
  releaseBookingEscrowInTx,
} from "../lib/wallet.service.js";
import { dispatchPaymobRefund } from "../lib/paymob.service.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const PAYMOB_BASE = "https://accept.paymob.com/api";
const router: IRouter = Router();

interface JwtPayload { sub: number; role: string }
function decodeJwt(authHeader: string | undefined): JwtPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try { return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as JwtPayload; }
  catch { return null; }
}

type PlanType = "MONTHS_3" | "MONTHS_6" | "YEARLY";
type UserRole = "doctor" | "medical_center";

const PLAN_LABELS: Record<PlanType, string> = {
  MONTHS_3: "3-Month Subscription",
  MONTHS_6: "6-Month Subscription",
  YEARLY:   "1-Year Subscription",
};

function isAllowedRole(role: string): role is UserRole {
  return role === "doctor" || role === "medical_center";
}

/* ── Fetch pricing settings, role-aware ── */
async function getPricingSettings(role: UserRole = "doctor") {
  const isCenter = role === "medical_center";
  const keys = isCenter
    ? ["center_price_3_months", "center_price_6_months", "center_price_1_year", "default_free_trial_days", "subscription_currency"]
    : ["doctor_price_3_months", "doctor_price_6_months", "doctor_price_1_year",
       "price_3_months", "price_6_months", "price_1_year",
       "default_free_trial_days", "subscription_currency"];

  const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, keys));
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;

  if (isCenter) {
    return {
      price3Months: Number(m["center_price_3_months"] ?? 1200),
      price6Months: Number(m["center_price_6_months"] ?? 2200),
      price1Year:   Number(m["center_price_1_year"]   ?? 3800),
      trialDays:    Number(m["default_free_trial_days"] ?? 14),
      currency:     m["subscription_currency"] ?? "EGP",
    };
  }

  return {
    price3Months: Number(m["doctor_price_3_months"] ?? m["price_3_months"] ?? 800),
    price6Months: Number(m["doctor_price_6_months"] ?? m["price_6_months"] ?? 1500),
    price1Year:   Number(m["doctor_price_1_year"]   ?? m["price_1_year"]   ?? 2500),
    trialDays:    Number(m["default_free_trial_days"] ?? 14),
    currency:     m["subscription_currency"] ?? "EGP",
  };
}

function planPrice(settings: Awaited<ReturnType<typeof getPricingSettings>>, plan: PlanType) {
  return { MONTHS_3: settings.price3Months, MONTHS_6: settings.price6Months, YEARLY: settings.price1Year }[plan];
}

function planMonths(plan: PlanType) {
  return { MONTHS_3: 3, MONTHS_6: 6, YEARLY: 12 }[plan];
}

/* ── Get or lazy-create medical center record ── */
async function getOrCreateMedicalCenter(userId: number) {
  const [existing] = await db.select().from(medicalCentersTable)
    .where(eq(medicalCentersTable.userId, userId)).limit(1);
  if (existing) return existing;

  const [user] = await db.select({ name: usersTable.name, nameAr: usersTable.nameAr })
    .from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  const [created] = await db.insert(medicalCentersTable).values({
    userId,
    name: user?.name ?? "Medical Center",
    nameAr: user?.nameAr ?? null,
  }).returning();
  return created;
}

/* ── Get doctor record ── */
async function getDoctor(userId: number) {
  const [row] = await db.select().from(doctorsTable)
    .where(eq(doctorsTable.userId, userId)).limit(1);
  return row ?? null;
}

async function resolveBookingEscrowOwner(doctorId: number): Promise<{
  ownerType: WalletOwnerType;
  ownerId: string;
}> {
  const [doctor] = await db.select({
    userId: doctorsTable.userId,
    affiliatedCenterId: doctorsTable.affiliatedCenterId,
  }).from(doctorsTable).where(eq(doctorsTable.id, doctorId)).limit(1);
  if (!doctor) throw new Error("Doctor not found");
  if (doctor.affiliatedCenterId) {
    const [center] = await db.select({
      userId: medicalCentersTable.userId,
      subType: medicalCentersTable.subType,
    }).from(medicalCentersTable)
      .where(eq(medicalCentersTable.id, doctor.affiliatedCenterId))
      .limit(1);
    if (center) {
      return {
        ownerType: centerSubtypeToWalletOwnerType(center.subType),
        ownerId: String(center.userId),
      };
    }
  }
  return { ownerType: "DOCTOR", ownerId: String(doctor.userId) };
}

/* ─── GET /billing/payments ─── */
router.get("/billing/payments", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const [expiryRow] = await db.select({ value: siteSettingsTable.value })
    .from(siteSettingsTable).where(eq(siteSettingsTable.key, "pending_payment_expiry_minutes")).limit(1);
  const rawExpiry = Number(expiryRow?.value);
  const expiryMinutes = Number.isFinite(rawExpiry) && rawExpiry > 0 ? rawExpiry : 30;
  const pendingCutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);

  let whereFilter;
  if (payload.role === "doctor") {
    const doctor = await getDoctor(payload.sub);
    if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
    whereFilter = and(
      eq(paymentsTable.doctorId, doctor.id),
      or(ne(paymentsTable.status, "PENDING"), gte(paymentsTable.createdAt, pendingCutoff)),
    );
  } else {
    const center = await getOrCreateMedicalCenter(payload.sub);
    whereFilter = and(
      eq(paymentsTable.medicalCenterId, center.id),
      or(ne(paymentsTable.status, "PENDING"), gte(paymentsTable.createdAt, pendingCutoff)),
    );
  }

  const payments = await db.select({
    id: paymentsTable.id,
    planType: paymentsTable.planType,
    amount: paymentsTable.amount,
    currency: paymentsTable.currency,
    status: paymentsTable.status,
    voucherCode: paymentsTable.voucherCode,
    paymobOrderId: paymentsTable.paymobOrderId,
    paymobTransactionId: paymentsTable.paymobTransactionId,
    createdAt: paymentsTable.createdAt,
    paidAt: paymentsTable.paidAt,
  }).from(paymentsTable).where(whereFilter).orderBy(desc(paymentsTable.createdAt));

  res.json(payments.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    paidAt: p.paidAt?.toISOString() ?? null,
  })));
});

/* ─── GET /billing/subscription ─── */
router.get("/billing/subscription", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const role = payload.role as UserRole;
  const settings = await getPricingSettings(role);
  const [financialSettings] = await db.select({
    subscriptionModelEnabled: systemSettingsTable.subscriptionModelEnabled,
  }).from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
  const subscriptionModelEnabled = financialSettings?.subscriptionModelEnabled ?? false;

  if (role === "doctor") {
    const doctor = await getDoctor(payload.sub);
    if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

    let status = doctor.subscriptionStatus ?? "INACTIVE";
    if ((status === "ACTIVE" || status === "TRIAL") && doctor.subscriptionEndDate && doctor.subscriptionEndDate < new Date()) {
      status = "INACTIVE";
      await db.update(doctorsTable).set({ subscriptionStatus: "INACTIVE" }).where(eq(doctorsTable.id, doctor.id));
    }

    res.json({
      status,
      plan: doctor.subscriptionPlan ?? "SEMI_ANNUAL",
      endDate: doctor.subscriptionEndDate?.toISOString() ?? null,
      isTrialUsed: doctor.isTrialUsed ?? false,
      subscriptionModelEnabled,
      ...settings,
    });
    return;
  }

  // medical_center
  const center = await getOrCreateMedicalCenter(payload.sub);

  let status = center.subscriptionStatus ?? "INACTIVE";
  if ((status === "ACTIVE" || status === "TRIAL") && center.subscriptionEndDate && center.subscriptionEndDate < new Date()) {
    status = "INACTIVE";
    await db.update(medicalCentersTable).set({ subscriptionStatus: "INACTIVE" }).where(eq(medicalCentersTable.id, center.id));
  }

  res.json({
    status,
    plan: center.subscriptionPlan ?? "SEMI_ANNUAL",
    endDate: center.subscriptionEndDate?.toISOString() ?? null,
    isTrialUsed: center.isTrialUsed ?? false,
    subscriptionModelEnabled,
    ...settings,
  });
});

/* ─── POST /billing/start-trial ─── */
router.post("/billing/start-trial", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const role = payload.role as UserRole;
  const settings = await getPricingSettings(role);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + settings.trialDays);

  if (role === "doctor") {
    const doctor = await getDoctor(payload.sub);
    if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
    if (doctor.isTrialUsed) { res.status(400).json({ error: "Free trial has already been used." }); return; }

    await db.update(doctorsTable).set({
      subscriptionStatus: "TRIAL",
      subscriptionPlan: "TRIAL",
      subscriptionEndDate: endDate,
      isTrialUsed: true,
    }).where(eq(doctorsTable.id, doctor.id));

    req.log.info({ doctorId: doctor.id, trialDays: settings.trialDays }, "Doctor free trial started");
  } else {
    const center = await getOrCreateMedicalCenter(payload.sub);
    if (center.isTrialUsed) { res.status(400).json({ error: "Free trial has already been used." }); return; }

    await db.update(medicalCentersTable).set({
      subscriptionStatus: "TRIAL",
      subscriptionPlan: "TRIAL",
      subscriptionEndDate: endDate,
      isTrialUsed: true,
    }).where(eq(medicalCentersTable.id, center.id));

    req.log.info({ centerId: center.id, trialDays: settings.trialDays }, "Medical center free trial started");
  }

  res.json({ success: true, status: "TRIAL", endDate: endDate.toISOString(), trialDays: settings.trialDays });
});

/* ─── POST /billing/validate-voucher ─── */
router.post("/billing/validate-voucher", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const schema = z.object({
    code: z.string().min(1),
    planType: z.enum(["MONTHS_3", "MONTHS_6", "YEARLY"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid input" }); return; }
  const { code, planType } = parsed.data;

  const [voucher] = await db.select().from(vouchersTable)
    .where(eq(vouchersTable.code, code.toUpperCase())).limit(1);

  if (!voucher || !voucher.isActive) { res.status(400).json({ error: "Invalid or inactive promo code." }); return; }
  if (voucher.expirationDate && voucher.expirationDate < new Date()) { res.status(400).json({ error: "Promo code has expired." }); return; }
  if (voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses) { res.status(400).json({ error: "Promo code usage limit reached." }); return; }

  const settings = await getPricingSettings(payload.role as UserRole);
  const originalPrice = planPrice(settings, planType as PlanType);
  const discount = (originalPrice * voucher.discountPercentage) / 100;
  const finalPrice = Math.max(0, originalPrice - discount);

  res.json({
    valid: true,
    code: voucher.code,
    discountPercentage: voucher.discountPercentage,
    additionalFreeDays: voucher.additionalFreeDays,
    originalPrice,
    finalPrice,
    currency: settings.currency,
  });
});

/* ─── POST /billing/paymob/initiate ─── */
router.post("/billing/paymob/initiate", async (req, res): Promise<void> => {
  const apiKey = process.env.PAYMOB_API_KEY;
  const uatBypass = process.env.UAT_PAYMENT_BYPASS === "true";

  if (!apiKey && !uatBypass) {
    res.status(503).json({ error: "Payment gateway not configured. Please contact support." });
    return;
  }

  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const schema = z.object({
    planType: z.enum(["MONTHS_3", "MONTHS_6", "YEARLY"]),
    voucherCode: z.string().optional(),
    paymentMethod: z.enum(["card", "fawry", "wallet"]).default("card"),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid checkout data" }); return; }
  const { planType, voucherCode, paymentMethod } = parsed.data;

  let integrationId: string | undefined;
  let iframeId: string | undefined;
  if (paymentMethod === "card") {
    integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;
    iframeId = process.env.PAYMOB_IFRAME_ID;
  } else if (paymentMethod === "fawry") {
    integrationId = process.env.PAYMOB_FAWRY_INTEGRATION_ID;
    iframeId = process.env.PAYMOB_FAWRY_IFRAME_ID;
  } else if (paymentMethod === "wallet") {
    integrationId = process.env.PAYMOB_WALLET_INTEGRATION_ID;
    iframeId = process.env.PAYMOB_WALLET_IFRAME_ID;
  }
  if (!uatBypass && (!integrationId || !iframeId)) {
    const label = paymentMethod === "card" ? "Card" : paymentMethod === "fawry" ? "Fawry" : "Wallet";
    res.status(422).json({ error: `${label} payments are not yet configured. Please choose another payment method or contact support.` });
    return;
  }

  const role = payload.role as UserRole;
  const settings = await getPricingSettings(role);
  let finalAmount = planPrice(settings, planType as PlanType);
  let appliedVoucherCode: string | null = null;

  // Resolve entity (doctor or center)
  let doctorId: number | null = null;
  let centerId: number | null = null;

  if (role === "doctor") {
    const doctor = await getDoctor(payload.sub);
    if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
    doctorId = doctor.id;
  } else {
    const center = await getOrCreateMedicalCenter(payload.sub);
    centerId = center.id;
  }

  if (voucherCode) {
    const [voucher] = await db.select().from(vouchersTable)
      .where(eq(vouchersTable.code, voucherCode.toUpperCase())).limit(1);
    if (
      voucher && voucher.isActive &&
      !(voucher.expirationDate && voucher.expirationDate < new Date()) &&
      !(voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses)
    ) {
      finalAmount = Math.max(0, finalAmount - (finalAmount * voucher.discountPercentage) / 100);
      appliedVoucherCode = voucher.code;
    }
  }

  const amountCents = Math.round(finalAmount * 100);
  const currency = settings.currency || "EGP";

  /* ── UAT bypass: skip Paymob, activate subscription immediately ── */
  if (uatBypass) {
    const uatOrderId = `UAT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.transaction(async (tx) => {
      const [payment] = await tx.insert(paymentsTable).values({
        doctorId,
        medicalCenterId: centerId,
        paymobOrderId: uatOrderId,
        planType,
        amount: finalAmount,
        currency,
        voucherCode: appliedVoucherCode,
        status: "PAID",
        paidAt: new Date(),
      }).returning();
      if (finalAmount > 0) {
        await recordSubscriptionFeeInTx(tx, {
          amount: finalAmount,
          paymentId: String(payment.id),
        });
      }

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + planMonths(planType as PlanType));

      if (appliedVoucherCode) {
        const [voucher] = await tx.select().from(vouchersTable)
          .where(eq(vouchersTable.code, appliedVoucherCode)).limit(1);
        if (voucher) {
          if (voucher.additionalFreeDays > 0) endDate.setDate(endDate.getDate() + voucher.additionalFreeDays);
          await tx.update(vouchersTable)
            .set({ currentUses: voucher.currentUses + 1 })
            .where(eq(vouchersTable.id, voucher.id));
        }
      }

      if (doctorId !== null) {
        const [doc] = await tx.select({ subscriptionEndDate: doctorsTable.subscriptionEndDate })
          .from(doctorsTable).where(eq(doctorsTable.id, doctorId)).limit(1);
        const base = doc?.subscriptionEndDate && doc.subscriptionEndDate > new Date() ? doc.subscriptionEndDate : new Date();
        const ed = new Date(base);
        ed.setMonth(ed.getMonth() + planMonths(planType as PlanType));
        if (appliedVoucherCode) {
          const [voucher] = await tx.select().from(vouchersTable)
            .where(eq(vouchersTable.code, appliedVoucherCode)).limit(1);
          if (voucher?.additionalFreeDays) ed.setDate(ed.getDate() + voucher.additionalFreeDays);
        }
        await tx.update(doctorsTable).set({
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: planType,
          subscriptionEndDate: ed,
        }).where(eq(doctorsTable.id, doctorId));
      } else if (centerId !== null) {
        const [ctr] = await tx.select({ subscriptionEndDate: medicalCentersTable.subscriptionEndDate })
          .from(medicalCentersTable).where(eq(medicalCentersTable.id, centerId)).limit(1);
        const base = ctr?.subscriptionEndDate && ctr.subscriptionEndDate > new Date() ? ctr.subscriptionEndDate : new Date();
        const ed = new Date(base);
        ed.setMonth(ed.getMonth() + planMonths(planType as PlanType));
        if (appliedVoucherCode) {
          const [voucher] = await tx.select().from(vouchersTable)
            .where(eq(vouchersTable.code, appliedVoucherCode)).limit(1);
          if (voucher?.additionalFreeDays) ed.setDate(ed.getDate() + voucher.additionalFreeDays);
        }
        await tx.update(medicalCentersTable).set({
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: planType,
          subscriptionEndDate: ed,
        }).where(eq(medicalCentersTable.id, centerId));
      }
    });

    const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;
    req.log.info({ doctorId, centerId, planType, uatOrderId }, "UAT payment bypass — subscription activated");
    res.json({
      paymentKey: "uat-bypass",
      iframeId: "uat",
      orderId: uatOrderId,
      paymentId: 0,
      iframeUrl: `${origin}/billing/payment-result?success=true&order_id=${uatOrderId}`,
    });
    return;
  }

  try {
    const authRes = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!authRes.ok) throw new Error(`Paymob auth failed: ${authRes.status}`);
    const { token: authToken } = await authRes.json() as { token: string };

    const orderRes = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency,
        items: [{
          name: PLAN_LABELS[planType as PlanType],
          amount_cents: amountCents,
          description: `EGY Doctors — ${PLAN_LABELS[planType as PlanType]}`,
          quantity: 1,
        }],
      }),
    });
    if (!orderRes.ok) throw new Error(`Paymob order failed: ${orderRes.status}`);
    const orderData = await orderRes.json() as { id: number };
    const paymobOrderId = String(orderData.id);

    const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;
    const returnUrl = `${origin}/billing/payment-result`;

    const keyRes = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: "NA", email: "NA", floor: "NA", first_name: "User",
          street: "NA", building: "NA", phone_number: "NA", shipping_method: "NA",
          postal_code: "NA", city: "Cairo", country: "EG", last_name: "NA", state: "NA",
        },
        currency,
        integration_id: Number(integrationId),
        lock_order_when_paid: true,
        redirect_url: returnUrl,
      }),
    });
    if (!keyRes.ok) throw new Error(`Paymob payment key failed: ${keyRes.status}`);
    const keyData = await keyRes.json() as { token: string };

    const [payment] = await db.insert(paymentsTable).values({
      doctorId,
      medicalCenterId: centerId,
      paymobOrderId,
      planType,
      amount: finalAmount,
      currency,
      voucherCode: appliedVoucherCode,
      status: "PENDING",
    }).returning();

    req.log.info({ doctorId, centerId, planType, amountCents, paymobOrderId }, "Paymob payment initiated");

    res.json({
      paymentKey: keyData.token,
      iframeId,
      orderId: paymobOrderId,
      paymentId: payment.id,
      iframeUrl: `${PAYMOB_BASE}/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`,
    });
  } catch (err) {
    req.log.error({ err }, "Paymob initiate error");
    res.status(502).json({ error: "Failed to initiate payment. Please try again." });
  }
});

/* ─── POST /billing/paymob/appointments/:id/initiate ─── */
router.post(["/billing/paymob/appointments/:id/initiate", "/appointments/:id/payment"], async (req, res): Promise<void> => {
  const apiKey = process.env.PAYMOB_API_KEY;
  const uatBypass = process.env.UAT_PAYMENT_BYPASS === "true";
  if (!apiKey && !uatBypass) {
    res.status(503).json({ error: "Payment gateway not configured. Please contact support." });
    return;
  }

  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "patient") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
   const [activePatient] = await db.select({ id: usersTable.id, role: usersTable.role, isActive: usersTable.isActive })
     .from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1);
   if (!activePatient || activePatient.role !== "patient" || !activePatient.isActive) {
     res.status(403).json({ error: "Patient account is not active" });
     return;
   }
  const appointmentId = Number(req.params.id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    res.status(400).json({ error: "Invalid appointment ID" });
    return;
  }

  const [appointment] = await db.select().from(appointmentsTable)
    .where(and(
      eq(appointmentsTable.id, appointmentId),
      eq(appointmentsTable.patientUserId, payload.sub),
    ))
    .limit(1);
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }
  if (appointment.status === "completed" || appointment.status === "cancelled") {
    res.status(409).json({ error: "A terminal appointment cannot be paid" });
    return;
  }
  if (!appointment.feeCharged || appointment.feeCharged <= 0) {
    res.status(422).json({ error: "This appointment does not require payment" });
    return;
  }
  const [existingPayment] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.appointmentId, appointmentId)).limit(1);
  if (existingPayment && existingPayment.status !== "FAILED") {
    res.status(409).json({ error: existingPayment.status === "PAID" ? "Appointment is already paid" : "An appointment payment is already in progress" });
    return;
  }
   const methodResult = z.enum(["CARD", "WALLET", "CASH", "FAWRY"]).safeParse(String(req.body?.paymentMethod ?? "CARD").toUpperCase());
  if (!methodResult.success) { res.status(422).json({ error: "Invalid payment method" }); return; }
   const requestedMethod = methodResult.data;
   if (requestedMethod === "FAWRY") {
     res.status(422).json({ error: "Fawry booking payments are not configured for asynchronous reference payments yet." });
     return;
   }
  const cashbackInput = z.object({ useCashback: z.boolean().default(false) }).safeParse(req.body ?? {});
  if (!cashbackInput.success) { res.status(422).json({ error: "Invalid cashback amount" }); return; }
  const [clinic] = appointment.clinicId
    ? await db.select({ acceptedPaymentMethods: clinicsTable.acceptedPaymentMethods }).from(clinicsTable).where(eq(clinicsTable.id, appointment.clinicId)).limit(1)
    : [];
   const accepted = clinic?.acceptedPaymentMethods?.length ? clinic.acceptedPaymentMethods : ["CASH"];
  if (!accepted.includes(requestedMethod)) { res.status(422).json({ error: "Selected payment method is not accepted by this clinic" }); return; }
  if (requestedMethod === "CASH") { res.status(422).json({ error: "Cash bookings do not require online payment" }); return; }
  const [patientWallet] = await db.select({ balance: walletsTable.balance }).from(walletsTable)
    .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(payload.sub))));
  const requestedCashback = existingPayment?.status === "FAILED" && existingPayment.cashbackAmount > 0
    ? existingPayment.cashbackAmount
    : cashbackInput.data.useCashback ? Math.min(patientWallet?.balance ?? 0, appointment.feeCharged) : 0;
  let cashbackUsed = 0;
  cashbackUsed = requestedCashback;

  const remainder = appointment.feeCharged - cashbackUsed;
  const owner = await resolveBookingEscrowOwner(appointment.doctorId);
  if (remainder === 0) {
    const [payment] = await db.transaction(async (tx) => {
      if (cashbackUsed > 0) {
        const [patient] = await tx.update(walletsTable).set({ balance: sql`${walletsTable.balance} - ${cashbackUsed}`, updatedAt: new Date() })
          .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(payload.sub)), gte(walletsTable.balance, cashbackUsed))).returning();
        if (!patient) throw new Error("Insufficient cashback balance");
        await tx.insert(walletTransactionsTable).values({ walletId: patient.id, type: "DEBIT", category: "CASHBACK_USAGE", amount: cashbackUsed, balancePost: patient.balance, referenceId: String(appointmentId), description: "Cashback applied to booking" });
      }
      const [created] = await tx.insert(paymentsTable).values({ appointmentId, escrowOwnerType: owner.ownerType, escrowOwnerId: owner.ownerId, planType: "BOOKING", amount: 0, cashbackAmount: cashbackUsed, currency: "EGP", status: "PAID", paidAt: new Date(), escrowedAt: new Date() }).returning();
      await escrowBookingInTx(tx, { ...owner, amount: appointment.feeCharged!, bookingId: String(appointmentId) });
      return [created];
    });
    res.json({ paymentKey: "cashback-settled", iframeId: "none", orderId: `CASHBACK-${appointmentId}`, paymentId: payment.id, iframeUrl: "" });
    return;
  }
  const amountCents = Math.round(remainder * 100);
  const orderReference = `appointment-${appointmentId}`;

  if (uatBypass) {
    const orderId = `UAT-BOOKING-${appointmentId}-${Date.now()}`;
    const [payment] = await db.transaction(async (tx) => {
      if (cashbackUsed > 0) {
        const [patient] = await tx.update(walletsTable).set({ balance: sql`${walletsTable.balance} - ${cashbackUsed}`, updatedAt: new Date() })
          .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(payload.sub)), gte(walletsTable.balance, cashbackUsed))).returning();
        if (!patient) throw new Error("Insufficient cashback balance");
        await tx.insert(walletTransactionsTable).values({ walletId: patient.id, type: "DEBIT", category: "CASHBACK_USAGE", amount: cashbackUsed, balancePost: patient.balance, referenceId: String(appointmentId), description: "Cashback applied to booking" });
      }
      const values = {
        appointmentId,
        escrowOwnerType: owner.ownerType,
        escrowOwnerId: owner.ownerId,
        paymobOrderId: orderId,
        planType: "BOOKING",
        amount: remainder,
        cashbackAmount: cashbackUsed,
        currency: "EGP",
        status: "PAID" as const,
        paidAt: new Date(),
        escrowedAt: new Date(),
      };
      const [created] = existingPayment
        ? await tx.update(paymentsTable).set(values)
          .where(and(eq(paymentsTable.id, existingPayment.id), eq(paymentsTable.status, "FAILED")))
          .returning()
        : await tx.insert(paymentsTable).values(values).returning();
      await escrowBookingInTx(tx, {
        ...owner,
        amount: appointment.feeCharged!,
        bookingId: String(appointmentId),
      });
      return [created];
    });
    const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;
    res.json({
      paymentKey: "uat-bypass",
      iframeId: "uat",
      orderId,
      paymentId: payment.id,
      iframeUrl: `${origin}/billing/payment-result?success=true&kind=booking&appointment_id=${appointmentId}&order_id=${orderId}`,
    });
    return;
  }

   const integrationId = requestedMethod === "WALLET"
     ? process.env.PAYMOB_WALLET_INTEGRATION_ID
     : process.env.PAYMOB_CARD_INTEGRATION_ID;
   const iframeId = requestedMethod === "WALLET"
     ? process.env.PAYMOB_WALLET_IFRAME_ID
     : process.env.PAYMOB_IFRAME_ID;
  if (!integrationId || !iframeId) {
     const label = requestedMethod === "WALLET" ? "Wallet" : "Card";
     res.status(422).json({ error: `${label} payments are not configured.` });
    return;
  }

  try {
    const authRes = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    });
    if (!authRes.ok) throw new Error(`Paymob auth failed: ${authRes.status}`);
    const { token: authToken } = await authRes.json() as { token: string };

    const orderRes = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: "EGP",
        items: [{
          name: `Appointment #${appointmentId}`,
          amount_cents: amountCents,
          description: orderReference,
          quantity: 1,
        }],
      }),
    });
    if (!orderRes.ok) throw new Error(`Paymob order failed: ${orderRes.status}`);
    const orderData = await orderRes.json() as { id: number };
    const paymobOrderId = String(orderData.id);
    const origin = (req.headers.origin as string | undefined) ?? `https://${req.headers.host}`;

    const keyRes = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: "NA", email: "NA", floor: "NA", first_name: appointment.patientName,
          street: "NA", building: "NA", phone_number: appointment.patientPhone, shipping_method: "NA",
          postal_code: "NA", city: "Cairo", country: "EG", last_name: "NA", state: "NA",
        },
        currency: "EGP",
        integration_id: Number(integrationId),
        lock_order_when_paid: true,
        redirect_url: `${origin}/billing/payment-result?kind=booking&appointment_id=${appointmentId}`,
      }),
    });
    if (!keyRes.ok) throw new Error(`Paymob payment key failed: ${keyRes.status}`);
    const keyData = await keyRes.json() as { token: string };

    const values = {
      appointmentId,
      escrowOwnerType: owner.ownerType,
      escrowOwnerId: owner.ownerId,
      paymobOrderId,
      planType: "BOOKING",
     amount: remainder,
     cashbackAmount: cashbackUsed,
      currency: "EGP",
      status: "PENDING" as const,
      paymobTransactionId: null,
      paidAt: null,
    };
    const [payment] = await db.transaction(async (tx) => {
      if (cashbackUsed > 0 && !(existingPayment?.status === "FAILED" && existingPayment.cashbackAmount > 0)) {
        const [patient] = await tx.update(walletsTable).set({ balance: sql`${walletsTable.balance} - ${cashbackUsed}`, updatedAt: new Date() })
          .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(payload.sub)), gte(walletsTable.balance, cashbackUsed))).returning();
        if (!patient) throw new Error("Insufficient cashback balance");
        await tx.insert(walletTransactionsTable).values({ walletId: patient.id, type: "DEBIT", category: "CASHBACK_USAGE", amount: cashbackUsed, balancePost: patient.balance, referenceId: String(appointmentId), description: "Cashback applied to booking" });
      }
      return existingPayment
        ? tx.update(paymentsTable).set(values).where(and(eq(paymentsTable.id, existingPayment.id), eq(paymentsTable.status, "FAILED"))).returning()
        : tx.insert(paymentsTable).values(values).returning();
    });
    res.json({
      paymentKey: keyData.token,
      iframeId,
      orderId: paymobOrderId,
      paymentId: payment.id,
      iframeUrl: `${PAYMOB_BASE}/acceptance/iframes/${iframeId}?payment_token=${keyData.token}`,
    });
  } catch (err) {
    req.log.error({ err, appointmentId }, "Paymob booking initiate error");
    res.status(502).json({ error: "Failed to initiate payment. Please try again." });
  }
});

router.get("/billing/paymob/appointments/:id/status", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "patient") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const appointmentId = Number(req.params.id);
  const [payment] = await db.select({
    status: paymentsTable.status,
    paymobOrderId: paymentsTable.paymobOrderId,
  }).from(paymentsTable)
    .innerJoin(appointmentsTable, eq(appointmentsTable.id, paymentsTable.appointmentId))
    .where(and(
      eq(paymentsTable.appointmentId, appointmentId),
      eq(appointmentsTable.patientUserId, payload.sub),
    ))
    .limit(1);
  if (!payment) {
    res.status(404).json({ error: "Booking payment not found" });
    return;
  }
  res.json(payment);
});

/* ─── POST /billing/paymob/webhook ─── */
router.post("/billing/paymob/webhook", async (req, res): Promise<void> => {
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

  if (!hmacSecret) {
    logger.error("PAYMOB_HMAC_SECRET is not set — refusing to process unauthenticated webhook");
    res.status(500).json({ error: "Webhook authentication is not configured on this server." });
    return;
  }

  {
    const receivedHmac = req.query["hmac"] as string | undefined;
    const obj = (req.body as Record<string, unknown>)?.obj as Record<string, unknown> ?? {};
    const sourceData = obj["source_data"] as Record<string, unknown> ?? {};
    const order = obj["order"] as Record<string, unknown> ?? {};

    const fields = [
      String(obj["amount_cents"] ?? ""),
      String(obj["created_at"] ?? ""),
      String(obj["currency"] ?? ""),
      String(obj["error_occured"] ?? ""),
      String(obj["has_parent_transaction"] ?? ""),
      String(obj["id"] ?? ""),
      String(obj["integration_id"] ?? ""),
      String(obj["is_3d_secure"] ?? ""),
      String(obj["is_auth"] ?? ""),
      String(obj["is_capture"] ?? ""),
      String(obj["is_refunded"] ?? ""),
      String(obj["is_standalone_payment"] ?? ""),
      String(obj["is_voided"] ?? ""),
      String(order["id"] ?? ""),
      String(obj["owner"] ?? ""),
      String(obj["pending"] ?? ""),
      String(sourceData["pan"] ?? ""),
      String(sourceData["sub_type"] ?? ""),
      String(sourceData["type"] ?? ""),
      String(obj["success"] ?? ""),
    ].join("");

    const computed = crypto.createHmac("sha512", hmacSecret).update(fields).digest("hex");
    if (computed !== receivedHmac) {
      logger.warn({ receivedHmac }, "Paymob webhook HMAC mismatch");
      res.status(401).json({ error: "Invalid HMAC" });
      return;
    }
  }

  const body = req.body as Record<string, unknown>;
  if (body["type"] !== "TRANSACTION") { res.sendStatus(200); return; }

  const obj = body["obj"] as Record<string, unknown> ?? {};
  const success = obj["success"] === true;
  const isRefunded = obj["is_refunded"] === true;
  const orderObj = obj["order"] as Record<string, unknown> ?? {};
  const paymobOrderId = String(orderObj["id"] ?? "");
  const paymobTransactionId = String(obj["id"] ?? "");

  if (!paymobOrderId) { res.sendStatus(200); return; }

  if (isRefunded) {
    await db.transaction(async (tx) => {
      const [refunded] = await tx
        .update(paymentsTable)
        .set({ status: "REFUNDED", paymobTransactionId })
        .where(and(
          eq(paymentsTable.paymobOrderId, paymobOrderId),
          inArray(paymentsTable.status, ["PAID", "REFUND_PENDING", "REFUND_REQUESTED"]),
        ))
        .returning();
      if (!refunded) {
        logger.info({ paymobOrderId }, "Paymob refund already processed (idempotent skip)");
        return;
      }
      if (refunded.amount > 0 || refunded.cashbackAmount > 0) {
        if (refunded.appointmentId) {
            if (refunded.cashbackAmount > 0) {
              const [appointment] = await tx.select({ patientUserId: appointmentsTable.patientUserId }).from(appointmentsTable)
                .where(eq(appointmentsTable.id, refunded.appointmentId)).limit(1);
              if (appointment?.patientUserId) {
                const [patient] = await tx.update(walletsTable).set({
                  balance: sql`${walletsTable.balance} + ${refunded.cashbackAmount}`, updatedAt: new Date(),
                }).where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, String(appointment.patientUserId)))).returning();
                if (patient) await tx.insert(walletTransactionsTable).values({
                  walletId: patient.id, type: "CREDIT", category: "CASHBACK_REWARD",
                  amount: refunded.cashbackAmount, balancePost: patient.balance,
                  referenceId: String(refunded.id), description: "Cashback restored after booking refund",
                });
              }
            }
          if (refunded.escrowedAt && refunded.escrowOwnerType && refunded.escrowOwnerId) {
            await refundBookingEscrowInTx(tx, {
              ownerType: refunded.escrowOwnerType as WalletOwnerType,
              ownerId: refunded.escrowOwnerId,
            amount: refunded.amount + Number(refunded.cashbackAmount ?? 0),
              bookingId: String(refunded.appointmentId),
            });
          }
        } else {
          await recordSubscriptionRefundInTx(tx, {
            amount: refunded.amount,
            paymentId: String(refunded.id),
          });
        }
      }
    });
  } else if (success) {
    const [pendingRefund] = await db.select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(and(
        eq(paymentsTable.paymobOrderId, paymobOrderId),
        eq(paymentsTable.status, "REFUND_PENDING"),
      ))
      .limit(1);
    if (pendingRefund) {
      try {
        await dispatchPaymobRefund(pendingRefund.id);
        res.sendStatus(200);
      } catch (error) {
        logger.error({ error, paymentId: pendingRefund.id }, "Failed to retry Paymob booking refund");
        res.status(502).json({ error: "Refund request failed" });
      }
      return;
    }
    let paidPayment: typeof paymentsTable.$inferSelect | undefined;
    let activatedDoctorId: number | null = null;
    let activatedCenterId: number | null = null;

    let refundPaymentId: number | null = null;
    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(paymentsTable)
        .set({ status: "PAID", paymobTransactionId, paidAt: new Date() })
        .where(and(eq(paymentsTable.paymobOrderId, paymobOrderId), eq(paymentsTable.status, "PENDING")))
        .returning();

      if (!updated) {
        logger.info({ paymobOrderId }, "Paymob webhook already processed (idempotent skip)");
        return;
      }

      if (updated.amount > 0) {
        // Wallet top-ups use a distinct payment reference and are credited only
        // after this HMAC-verified successful callback. The status transition
        // above makes repeated callbacks idempotent.
        if (updated.planType === "WALLET_TOP_UP" && updated.doctorId) {
          const [wallet] = await tx.update(walletsTable).set({
            balance: sql`${walletsTable.balance} + ${updated.amount}`,
            updatedAt: new Date(),
          }).where(and(
            eq(walletsTable.ownerType, "DOCTOR"),
            eq(walletsTable.ownerId, sql`(SELECT user_id::text FROM doctors WHERE id = ${updated.doctorId})`),
          )).returning();
          if (wallet) {
            await tx.insert(walletTransactionsTable).values({
              walletId: wallet.id, type: "CREDIT", category: "WALLET_TOP_UP",
              amount: updated.amount, balancePost: wallet.balance,
              referenceId: String(updated.id), description: "Verified Paymob wallet top-up",
            });
          }
          paidPayment = updated;
          return;
        }
        if (updated.appointmentId && updated.escrowOwnerType && updated.escrowOwnerId) {
          const [appointment] = await tx.select({ status: appointmentsTable.status, patientUserId: appointmentsTable.patientUserId })
            .from(appointmentsTable)
            .where(eq(appointmentsTable.id, updated.appointmentId))
            .limit(1);
          if (appointment?.status === "cancelled") {
            await tx.update(paymentsTable)
              .set({ status: "REFUND_PENDING" })
              .where(eq(paymentsTable.id, updated.id));
            refundPaymentId = updated.id;
            paidPayment = updated;
            return;
          }
          await escrowBookingInTx(tx, {
            ownerType: updated.escrowOwnerType as WalletOwnerType,
            ownerId: updated.escrowOwnerId,
            amount: updated.amount + Number(updated.cashbackAmount ?? 0),
            bookingId: String(updated.appointmentId),
          });
          await tx.update(paymentsTable)
            .set({
              status: appointment?.status === "completed" ? "SETTLED" : "PAID",
              escrowedAt: new Date(),
            })
            .where(eq(paymentsTable.id, updated.id));
          if (appointment?.status === "completed") {
            await releaseBookingEscrowInTx(tx, {
              ownerType: updated.escrowOwnerType as WalletOwnerType,
              ownerId: updated.escrowOwnerId,
              amount: updated.amount + Number(updated.cashbackAmount ?? 0),
              bookingId: String(updated.appointmentId),
              commissionRate: 0.1,
              patientUserId: appointment?.patientUserId ? String(appointment.patientUserId) : null,
            });
          }
          paidPayment = updated;
          return;
        }
        await recordSubscriptionFeeInTx(tx, { amount: updated.amount, paymentId: String(updated.id) });
      }
      if (!updated.planType) {
        throw new Error("Subscription payment is missing a plan type");
      }
      const subscriptionPlan = updated.planType;

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + planMonths(subscriptionPlan as PlanType));

      if (updated.voucherCode) {
        const [voucher] = await tx.select().from(vouchersTable)
          .where(eq(vouchersTable.code, updated.voucherCode)).limit(1);
        if (voucher) {
          if (voucher.additionalFreeDays > 0) endDate.setDate(endDate.getDate() + voucher.additionalFreeDays);
          await tx.update(vouchersTable)
            .set({ currentUses: voucher.currentUses + 1 }).where(eq(vouchersTable.id, voucher.id));
        }
      }

      if (updated.doctorId !== null && updated.doctorId !== undefined) {
        const [doctor] = await tx.select({ id: doctorsTable.id, subscriptionEndDate: doctorsTable.subscriptionEndDate })
          .from(doctorsTable).where(eq(doctorsTable.id, updated.doctorId)).limit(1);
        if (doctor) {
          const base = doctor.subscriptionEndDate && doctor.subscriptionEndDate > new Date()
            ? doctor.subscriptionEndDate : new Date();
          const ed = new Date(base);
          ed.setMonth(ed.getMonth() + planMonths(subscriptionPlan as PlanType));
          if (updated.voucherCode) {
            const [v] = await tx.select().from(vouchersTable)
              .where(eq(vouchersTable.code, updated.voucherCode)).limit(1);
            if (v?.additionalFreeDays) ed.setDate(ed.getDate() + v.additionalFreeDays);
          }
          await tx.update(doctorsTable).set({
            subscriptionStatus: "ACTIVE",
            subscriptionPlan,
            subscriptionEndDate: ed,
          }).where(eq(doctorsTable.id, doctor.id));
          activatedDoctorId = doctor.id;
          logger.info({ doctorId: doctor.id, planType: updated.planType, paymobOrderId }, "Doctor subscription activated via webhook");
        }
      } else if (updated.medicalCenterId !== null && updated.medicalCenterId !== undefined) {
        const [center] = await tx.select({ id: medicalCentersTable.id, subscriptionEndDate: medicalCentersTable.subscriptionEndDate })
          .from(medicalCentersTable).where(eq(medicalCentersTable.id, updated.medicalCenterId)).limit(1);
        if (center) {
          const base = center.subscriptionEndDate && center.subscriptionEndDate > new Date()
            ? center.subscriptionEndDate : new Date();
          const ed = new Date(base);
          ed.setMonth(ed.getMonth() + planMonths(subscriptionPlan as PlanType));
          if (updated.voucherCode) {
            const [v] = await tx.select().from(vouchersTable)
              .where(eq(vouchersTable.code, updated.voucherCode)).limit(1);
            if (v?.additionalFreeDays) ed.setDate(ed.getDate() + v.additionalFreeDays);
          }
          await tx.update(medicalCentersTable).set({
            subscriptionStatus: "ACTIVE",
            subscriptionPlan,
            subscriptionEndDate: ed,
          }).where(eq(medicalCentersTable.id, center.id));
          activatedCenterId = center.id;
          logger.info({ centerId: center.id, planType: updated.planType, paymobOrderId }, "Medical center subscription activated via webhook");
        }
      }

      paidPayment = updated;
    });
    if (refundPaymentId !== null) {
      try {
        await dispatchPaymobRefund(refundPaymentId);
      } catch (error) {
        logger.error({ error, paymentId: refundPaymentId }, "Failed to request Paymob booking refund");
        res.status(502).json({ error: "Refund request failed" });
        return;
      }
    }

    // Send receipt email for doctor payments
    if (paidPayment && activatedDoctorId) {
      const payment = paidPayment;
      const doctorId = activatedDoctorId;
      (async () => {
        try {
          const [row] = await db
            .select({ email: usersTable.email, nameEn: doctorsTable.nameEn })
            .from(doctorsTable).innerJoin(usersTable, eq(usersTable.id, doctorsTable.userId))
            .where(eq(doctorsTable.id, doctorId)).limit(1);
          if (!row?.email) return;
          const pdfBuffer = await generateReceiptBuffer(payment, row.nameEn ?? "Doctor");
          await sendReceiptEmail(row.email, { ...payment, planType: payment.planType ?? "Subscription" }, row.nameEn ?? "Doctor", pdfBuffer);
        } catch (err) {
          logger.warn({ err, doctorId, paymentId: payment.id }, "Failed to send receipt email");
        }
      })();
    }
  } else {
    await db.update(paymentsTable)
      .set({ status: "FAILED", paymobTransactionId })
      .where(and(eq(paymentsTable.paymobOrderId, paymobOrderId), eq(paymentsTable.status, "PENDING")));
    logger.info({ paymobOrderId }, "Paymob payment failed");
  }

  res.sendStatus(200);
});

/* ─── POST /billing/checkout (admin-only — dev/testing) ─── */
router.post("/billing/checkout", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }

  const schema = z.object({
    planType: z.enum(["MONTHS_3", "MONTHS_6", "YEARLY"]),
    voucherCode: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid checkout data" }); return; }
  const { planType, voucherCode } = parsed.data;

  const doctor = await getDoctor(payload.sub);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const settings = await getPricingSettings("doctor");
  let finalPrice = planPrice(settings, planType as PlanType);
  let additionalFreeDays = 0;

  if (voucherCode) {
    const [voucher] = await db.select().from(vouchersTable)
      .where(eq(vouchersTable.code, voucherCode.toUpperCase())).limit(1);
    if (
      voucher && voucher.isActive &&
      !(voucher.expirationDate && voucher.expirationDate < new Date()) &&
      !(voucher.maxUses !== null && voucher.currentUses >= voucher.maxUses)
    ) {
      finalPrice = Math.max(0, finalPrice - (finalPrice * voucher.discountPercentage) / 100);
      additionalFreeDays = voucher.additionalFreeDays;
      await db.update(vouchersTable).set({ currentUses: voucher.currentUses + 1 })
        .where(eq(vouchersTable.code, voucherCode.toUpperCase()));
    }
  }

  const base = doctor.subscriptionEndDate && doctor.subscriptionEndDate > new Date()
    ? doctor.subscriptionEndDate : new Date();
  const endDate = new Date(base);
  endDate.setMonth(endDate.getMonth() + planMonths(planType as PlanType));
  if (additionalFreeDays > 0) endDate.setDate(endDate.getDate() + additionalFreeDays);

  await db.transaction(async (tx) => {
    await tx.update(doctorsTable).set({
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: planType,
      subscriptionEndDate: endDate,
    }).where(eq(doctorsTable.id, doctor.id));

    const [payment] = await tx.insert(paymentsTable).values({
      doctorId: doctor.id,
      planType,
      amount: finalPrice,
      currency: settings.currency,
      voucherCode: voucherCode ?? null,
      status: "PAID",
      paidAt: new Date(),
    }).returning();
    if (finalPrice > 0) {
      await recordSubscriptionFeeInTx(tx, {
        amount: finalPrice,
        paymentId: String(payment.id),
      });
    }
  });

  req.log.info({ doctorId: doctor.id, planType }, "Admin checkout — subscription activated");
  res.json({ success: true, status: "ACTIVE", plan: planType, endDate: endDate.toISOString(), price: finalPrice, currency: settings.currency });
});

/* ─── GET /billing/payments/:id/receipt ─── */
router.get("/billing/payments/:id/receipt", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || !isAllowedRole(payload.role)) { res.status(403).json({ error: "Forbidden" }); return; }

  const paymentId = Number(req.params.id);
  if (!paymentId) { res.status(400).json({ error: "Invalid payment ID" }); return; }

  const [payment] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, paymentId)).limit(1);
  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }

  // Verify ownership
  if (payload.role === "doctor") {
    const doctor = await getDoctor(payload.sub);
    if (!doctor || payment.doctorId !== doctor.id) { res.status(403).json({ error: "Forbidden" }); return; }
  } else {
    const center = await getOrCreateMedicalCenter(payload.sub);
    if (payment.medicalCenterId !== center.id) { res.status(403).json({ error: "Forbidden" }); return; }
  }

  const [userRow] = await db.select({ name: usersTable.name }).from(usersTable)
    .where(eq(usersTable.id, payload.sub)).limit(1);
  const name = userRow?.name ?? "User";

  const pdfBuffer = await generateReceiptBuffer(payment, name);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="receipt-${paymentId}.pdf"`);
  res.end(pdfBuffer);
});

/* ── PDF receipt generator ── */
async function generateReceiptBuffer(payment: typeof paymentsTable.$inferSelect, name: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#0F172A").text("EGY Doctors", { align: "center" });
    doc.fontSize(14).fillColor("#D4A853").text("Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#E2E8F0").stroke();
    doc.moveDown();

    doc.fontSize(11).fillColor("#374151");
    const fmt = (k: string, v: string) => doc.text(`${k}: ${v}`, { continued: false }).moveDown(0.3);
    fmt("Name", name);
    fmt("Payment ID", String(payment.id));
    fmt("Plan", payment.planType ?? "Appointment");
    fmt("Amount", `${payment.amount} ${payment.currency}`);
    fmt("Status", payment.status);
    if (payment.voucherCode) fmt("Promo Code", payment.voucherCode);
    if (payment.paymobOrderId) fmt("Order ID", payment.paymobOrderId);
    fmt("Date", payment.paidAt ? payment.paidAt.toLocaleDateString() : payment.createdAt.toLocaleDateString());

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#9CA3AF").text("Thank you for subscribing to EGY Doctors.", { align: "center" });

    doc.end();
  });
}

export default router;
