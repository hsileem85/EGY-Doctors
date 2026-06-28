import { Router, type IRouter } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, doctorsTable, siteSettingsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const router: IRouter = Router();

interface JwtPayload { sub: number; role: string }
function decodeJwt(authHeader: string | undefined): JwtPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as unknown as JwtPayload;
  } catch { return null; }
}

async function getSettingValue(key: string, fallback: string): Promise<string> {
  const [row] = await db.select({ value: siteSettingsTable.value })
    .from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
  return row?.value ?? fallback;
}

/* ─── GET /billing/subscription ─── */
router.get("/billing/subscription", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") {
    res.status(403).json({ error: "Only doctors can access billing info" });
    return;
  }

  const [doctor] = await db.select({
    id: doctorsTable.id,
    subscriptionStatus: doctorsTable.subscriptionStatus,
    subscriptionPlan: doctorsTable.subscriptionPlan,
    subscriptionEndDate: doctorsTable.subscriptionEndDate,
  }).from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);

  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  let status = doctor.subscriptionStatus ?? "INACTIVE";
  if (status === "ACTIVE" && doctor.subscriptionEndDate && doctor.subscriptionEndDate < new Date()) {
    status = "INACTIVE";
    await db.update(doctorsTable).set({ subscriptionStatus: "INACTIVE" }).where(eq(doctorsTable.id, doctor.id));
    logger.info({ doctorId: doctor.id }, "Doctor subscription auto-expired");
  }

  const price = Number(await getSettingValue("subscription_price", "1500"));
  const currency = await getSettingValue("subscription_currency", "EGP");

  res.json({
    status,
    plan: doctor.subscriptionPlan ?? "SEMI_ANNUAL",
    endDate: doctor.subscriptionEndDate?.toISOString() ?? null,
    price,
    currency,
  });
});

/* ─── POST /billing/checkout ─── */
router.post("/billing/checkout", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") {
    res.status(403).json({ error: "Only doctors can checkout" });
    return;
  }

  const [doctor] = await db.select({ id: doctorsTable.id, subscriptionEndDate: doctorsTable.subscriptionEndDate })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const price = Number(await getSettingValue("subscription_price", "1500"));
  const currency = await getSettingValue("subscription_currency", "EGP");

  const base = doctor.subscriptionEndDate && doctor.subscriptionEndDate > new Date()
    ? doctor.subscriptionEndDate
    : new Date();
  const endDate = new Date(base);
  endDate.setMonth(endDate.getMonth() + 6);

  await db.update(doctorsTable).set({
    subscriptionStatus: "ACTIVE",
    subscriptionPlan: "SEMI_ANNUAL",
    subscriptionEndDate: endDate,
  }).where(eq(doctorsTable.id, doctor.id));

  req.log.info({ doctorId: doctor.id, price, endDate }, "Doctor subscription activated");

  res.json({ success: true, status: "ACTIVE", endDate: endDate.toISOString(), price, currency, plan: "SEMI_ANNUAL" });
});

export default router;
