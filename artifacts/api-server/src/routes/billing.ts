import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db, doctorsTable, siteSettingsTable, vouchersTable } from "@workspace/db";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const router: IRouter = Router();

interface JwtPayload { sub: number; role: string }
function decodeJwt(authHeader: string | undefined): JwtPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try { return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as JwtPayload; }
  catch { return null; }
}

type PlanType = "MONTHS_3" | "MONTHS_6" | "YEARLY";

async function getPricingSettings() {
  const keys = ["price_3_months", "price_6_months", "price_1_year", "default_free_trial_days", "subscription_currency"];
  const rows = await db.select().from(siteSettingsTable).where(inArray(siteSettingsTable.key, keys));
  const m: Record<string, string> = {};
  for (const r of rows) m[r.key] = r.value;
  return {
    price3Months: Number(m["price_3_months"] ?? 800),
    price6Months: Number(m["price_6_months"] ?? 1500),
    price1Year:   Number(m["price_1_year"]   ?? 2500),
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

/* ─── GET /billing/subscription ─── */
router.get("/billing/subscription", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

  const [doctor] = await db.select({
    id: doctorsTable.id,
    subscriptionStatus: doctorsTable.subscriptionStatus,
    subscriptionPlan: doctorsTable.subscriptionPlan,
    subscriptionEndDate: doctorsTable.subscriptionEndDate,
    isTrialUsed: doctorsTable.isTrialUsed,
  }).from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);

  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  let status = doctor.subscriptionStatus ?? "INACTIVE";
  if ((status === "ACTIVE" || status === "TRIAL") && doctor.subscriptionEndDate && doctor.subscriptionEndDate < new Date()) {
    status = "INACTIVE";
    await db.update(doctorsTable).set({ subscriptionStatus: "INACTIVE" }).where(eq(doctorsTable.id, doctor.id));
    logger.info({ doctorId: doctor.id }, "Doctor subscription auto-expired");
  }

  const settings = await getPricingSettings();

  res.json({
    status,
    plan: doctor.subscriptionPlan ?? "SEMI_ANNUAL",
    endDate: doctor.subscriptionEndDate?.toISOString() ?? null,
    isTrialUsed: doctor.isTrialUsed ?? false,
    ...settings,
  });
});

/* ─── POST /billing/start-trial ─── */
router.post("/billing/start-trial", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

  const [doctor] = await db.select({ id: doctorsTable.id, isTrialUsed: doctorsTable.isTrialUsed })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }
  if (doctor.isTrialUsed) { res.status(400).json({ error: "Free trial has already been used." }); return; }

  const settings = await getPricingSettings();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + settings.trialDays);

  await db.update(doctorsTable).set({
    subscriptionStatus: "TRIAL",
    subscriptionPlan: "TRIAL",
    subscriptionEndDate: endDate,
    isTrialUsed: true,
  }).where(eq(doctorsTable.id, doctor.id));

  req.log.info({ doctorId: doctor.id, trialDays: settings.trialDays }, "Doctor free trial started");
  res.json({ success: true, status: "TRIAL", endDate: endDate.toISOString(), trialDays: settings.trialDays });
});

/* ─── POST /billing/validate-voucher ─── */
router.post("/billing/validate-voucher", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

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

  const settings = await getPricingSettings();
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

/* ─── POST /billing/checkout ─── */
router.post("/billing/checkout", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

  const schema = z.object({
    planType: z.enum(["MONTHS_3", "MONTHS_6", "YEARLY"]),
    voucherCode: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid checkout data" }); return; }
  const { planType, voucherCode } = parsed.data;

  const [doctor] = await db.select({ id: doctorsTable.id, subscriptionEndDate: doctorsTable.subscriptionEndDate })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const settings = await getPricingSettings();
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
      await db.update(vouchersTable)
        .set({ currentUses: voucher.currentUses + 1 })
        .where(eq(vouchersTable.id, voucher.id));
    }
  }

  const base = doctor.subscriptionEndDate && doctor.subscriptionEndDate > new Date()
    ? doctor.subscriptionEndDate : new Date();
  const endDate = new Date(base);
  endDate.setMonth(endDate.getMonth() + planMonths(planType as PlanType));
  if (additionalFreeDays > 0) endDate.setDate(endDate.getDate() + additionalFreeDays);

  await db.update(doctorsTable).set({
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: planType,
    subscriptionEndDate: endDate,
  }).where(eq(doctorsTable.id, doctor.id));

  req.log.info({ doctorId: doctor.id, planType, finalPrice, endDate }, "Doctor subscription activated");
  res.json({ success: true, status: "ACTIVE", plan: planType, endDate: endDate.toISOString(), price: finalPrice, currency: settings.currency });
});

export default router;
