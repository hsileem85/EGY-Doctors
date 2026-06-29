import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import { eq, inArray, and, desc, or, ne, gte } from "drizzle-orm";
import { z } from "zod";
import { db, doctorsTable, usersTable, siteSettingsTable, vouchersTable, paymentsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { sendReceiptEmail } from "../lib/email";

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

const PLAN_LABELS: Record<PlanType, string> = {
  MONTHS_3: "3-Month Subscription",
  MONTHS_6: "6-Month Subscription",
  YEARLY: "1-Year Subscription",
};

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

/* ─── GET /billing/payments ─── */
router.get("/billing/payments", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

  const [doctor] = await db.select({ id: doctorsTable.id })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  const [expiryRow] = await db
    .select({ value: siteSettingsTable.value })
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, "pending_payment_expiry_minutes"))
    .limit(1);
  const rawExpiry = Number(expiryRow?.value);
  const expiryMinutes = Number.isFinite(rawExpiry) && rawExpiry > 0 ? rawExpiry : 30;

  const pendingCutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);

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
  }).from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.doctorId, doctor.id),
        or(
          ne(paymentsTable.status, "PENDING"),
          gte(paymentsTable.createdAt, pendingCutoff),
        ),
      ),
    )
    .orderBy(desc(paymentsTable.createdAt));

  res.json(payments.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    paidAt: p.paidAt?.toISOString() ?? null,
  })));
});

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

/* ─── POST /billing/paymob/initiate ─── */
router.post("/billing/paymob/initiate", async (req, res): Promise<void> => {
  const apiKey = process.env.PAYMOB_API_KEY;

  if (!apiKey) {
    res.status(503).json({ error: "Payment gateway not configured. Please contact support." });
    return;
  }

  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

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
  if (!integrationId || !iframeId) {
    const label = paymentMethod === "card" ? "Card" : paymentMethod === "fawry" ? "Fawry" : "Wallet";
    res.status(422).json({ error: `${label} payments are not yet configured. Please choose another payment method or contact support.` });
    return;
  }

  const [doctor] = await db.select({ id: doctorsTable.id })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  const settings = await getPricingSettings();
  let finalAmount = planPrice(settings, planType as PlanType);
  let appliedVoucherCode: string | null = null;

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
          apartment: "NA", email: "NA", floor: "NA", first_name: "Doctor",
          street: "NA", building: "NA", phone_number: "NA", shipping_method: "NA",
          postal_code: "NA", city: "Cairo", country: "EG", last_name: "User", state: "NA",
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
      doctorId: doctor.id,
      paymobOrderId,
      planType,
      amount: finalAmount,
      currency,
      voucherCode: appliedVoucherCode,
      status: "PENDING",
    }).returning();

    req.log.info({ doctorId: doctor.id, planType, amountCents, paymobOrderId }, "Paymob payment initiated");

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
  const orderObj = obj["order"] as Record<string, unknown> ?? {};
  const paymobOrderId = String(orderObj["id"] ?? "");
  const paymobTransactionId = String(obj["id"] ?? "");

  if (!paymobOrderId) { res.sendStatus(200); return; }

  if (success) {
    let paidPayment: typeof paymentsTable.$inferSelect | undefined;
    let activatedDoctorId: number | undefined;

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

      const [doctor] = await tx
        .select({ id: doctorsTable.id, subscriptionEndDate: doctorsTable.subscriptionEndDate })
        .from(doctorsTable)
        .where(eq(doctorsTable.id, updated.doctorId))
        .limit(1);

      if (!doctor) return;

      const base = doctor.subscriptionEndDate && doctor.subscriptionEndDate > new Date()
        ? doctor.subscriptionEndDate : new Date();
      const endDate = new Date(base);
      endDate.setMonth(endDate.getMonth() + planMonths(updated.planType as PlanType));

      if (updated.voucherCode) {
        const [voucher] = await tx
          .select()
          .from(vouchersTable)
          .where(eq(vouchersTable.code, updated.voucherCode))
          .limit(1);
        if (voucher) {
          if (voucher.additionalFreeDays > 0) {
            endDate.setDate(endDate.getDate() + voucher.additionalFreeDays);
          }
          await tx
            .update(vouchersTable)
            .set({ currentUses: voucher.currentUses + 1 })
            .where(eq(vouchersTable.id, voucher.id));
        }
      }

      await tx.update(doctorsTable).set({
        subscriptionStatus: "ACTIVE",
        subscriptionPlan: updated.planType,
        subscriptionEndDate: endDate,
      }).where(eq(doctorsTable.id, doctor.id));

      logger.info({ doctorId: doctor.id, planType: updated.planType, paymobOrderId }, "Subscription activated via Paymob webhook");

      paidPayment = updated;
      activatedDoctorId = doctor.id;
    });

    if (paidPayment && activatedDoctorId) {
      const payment = paidPayment;
      const doctorId = activatedDoctorId;
      (async () => {
        try {
          const [row] = await db
            .select({ email: usersTable.email, nameEn: doctorsTable.nameEn })
            .from(doctorsTable)
            .innerJoin(usersTable, eq(usersTable.id, doctorsTable.userId))
            .where(eq(doctorsTable.id, doctorId))
            .limit(1);

          if (!row?.email) {
            logger.warn({ doctorId }, "Doctor has no email — skipping receipt email");
            return;
          }

          const pdfBuffer = await generateReceiptBuffer(payment, row.nameEn ?? "Doctor");
          await sendReceiptEmail(row.email, payment, row.nameEn ?? "Doctor", pdfBuffer);
          logger.info({ doctorId, paymentId: payment.id }, "Receipt email sent after successful payment");
        } catch (err) {
          logger.warn({ err, doctorId, paymentId: payment.id }, "Failed to send receipt email after payment");
        }
      })();
    }
  } else {
    await db
      .update(paymentsTable)
      .set({ status: "FAILED", paymobTransactionId })
      .where(and(eq(paymentsTable.paymobOrderId, paymobOrderId), eq(paymentsTable.status, "PENDING")));

    logger.info({ paymobOrderId }, "Paymob payment failed");
  }

  res.sendStatus(200);
});

/* ─── POST /billing/checkout (admin-only — dev/testing use only) ─── */
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

  req.log.info({ doctorId: doctor.id, planType, finalPrice, endDate }, "Doctor subscription activated (mock checkout)");
  res.json({ success: true, status: "ACTIVE", plan: planType, endDate: endDate.toISOString(), price: finalPrice, currency: settings.currency });
});

/* ─── Receipt PDF buffer helper ─── */
function generateReceiptBuffer(
  payment: {
    id: number;
    planType: string;
    amount: number;
    currency: string;
    paymobOrderId: string | null;
    paymobTransactionId: string | null;
    paidAt: Date | null;
    createdAt: Date;
  },
  doctorName: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const planLabels: Record<string, string> = {
      MONTHS_3: "3-Month Subscription",
      MONTHS_6: "6-Month Subscription",
      YEARLY: "1-Year Subscription",
    };
    const planLabel = planLabels[payment.planType] ?? payment.planType;
    const paymentDate = (payment.paidAt ?? payment.createdAt).toLocaleDateString("en-GB", {
      year: "numeric", month: "long", day: "numeric",
    });

    const PRIMARY = "#1a6fa8";
    const LIGHT_GRAY = "#f5f7fa";
    const MID_GRAY = "#6b7280";
    const DARK = "#111827";

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
    doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("EGY Doctors", 50, 28);
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(11).font("Helvetica").text("Payment Receipt", 50, 58);

    doc.fillColor(DARK).fontSize(13).font("Helvetica-Bold").text("Receipt", 50, 120);
    doc.fillColor(MID_GRAY).fontSize(10).font("Helvetica")
      .text(`Receipt #${payment.id}`, 50, 138)
      .text(`Date: ${paymentDate}`, 50, 152);

    const tableTop = 195;
    doc.rect(50, tableTop, doc.page.width - 100, 30).fill(LIGHT_GRAY);
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica-Bold")
      .text("FIELD", 65, tableTop + 10)
      .text("DETAILS", 300, tableTop + 10);

    const rows: Array<[string, string]> = [
      ["Doctor Name",    doctorName],
      ["Plan",           planLabel],
      ["Amount",         `${payment.amount.toLocaleString("en-EG")} ${payment.currency}`],
      ["Payment Date",   paymentDate],
      ["Order ID",       payment.paymobOrderId ?? "—"],
      ["Transaction ID", payment.paymobTransactionId ?? "—"],
      ["Status",         "PAID"],
    ];

    let rowY = tableTop + 30;
    rows.forEach(([label, value], i) => {
      if (i % 2 === 1) doc.rect(50, rowY, doc.page.width - 100, 28).fill("#fafafa");
      doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text(label, 65, rowY + 9);
      doc.fillColor(DARK).fontSize(9).font("Helvetica").text(value, 300, rowY + 9, { width: doc.page.width - 370 });
      rowY += 28;
    });

    doc.rect(50, rowY, doc.page.width - 100, 1).fill("#e5e7eb");

    const footerY = doc.page.height - 70;
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
      .text("Thank you for subscribing to EGY Doctors.", 50, footerY, { align: "center", width: doc.page.width - 100 })
      .text("This receipt is automatically generated and does not require a signature.", 50, footerY + 14, { align: "center", width: doc.page.width - 100 });

    doc.end();
  });
}

/* ─── GET /billing/payments/:id/receipt ─── */
router.get("/billing/payments/:id/receipt", async (req, res): Promise<void> => {
  const payload = decodeJwt(req.headers.authorization);
  if (!payload || payload.role !== "doctor") { res.status(403).json({ error: "Forbidden" }); return; }

  const paymentId = Number(req.params.id);
  if (!Number.isInteger(paymentId) || paymentId <= 0) { res.status(400).json({ error: "Invalid payment ID" }); return; }

  const [doctor] = await db.select({ id: doctorsTable.id, nameEn: doctorsTable.nameEn })
    .from(doctorsTable).where(eq(doctorsTable.userId, payload.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor not found" }); return; }

  const [payment] = await db.select({
    id: paymentsTable.id,
    doctorId: paymentsTable.doctorId,
    planType: paymentsTable.planType,
    amount: paymentsTable.amount,
    currency: paymentsTable.currency,
    status: paymentsTable.status,
    paymobOrderId: paymentsTable.paymobOrderId,
    paymobTransactionId: paymentsTable.paymobTransactionId,
    paidAt: paymentsTable.paidAt,
    createdAt: paymentsTable.createdAt,
  }).from(paymentsTable)
    .where(and(eq(paymentsTable.id, paymentId), eq(paymentsTable.doctorId, doctor.id)))
    .limit(1);

  if (!payment) { res.status(404).json({ error: "Payment not found" }); return; }
  if (payment.status !== "PAID") { res.status(400).json({ error: "Receipt is only available for paid transactions" }); return; }

  const planLabels: Record<string, string> = {
    MONTHS_3: "3-Month Subscription",
    MONTHS_6: "6-Month Subscription",
    YEARLY:   "1-Year Subscription",
  };
  const planLabel = planLabels[payment.planType] ?? payment.planType;
  const paymentDate = (payment.paidAt ?? payment.createdAt).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="receipt-${payment.id}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(res);

  const PRIMARY = "#1a6fa8";
  const LIGHT_GRAY = "#f5f7fa";
  const MID_GRAY = "#6b7280";
  const DARK = "#111827";

  doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY);
  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("EGY Doctors", 50, 28);
  doc.fillColor("rgba(255,255,255,0.7)").fontSize(11).font("Helvetica").text("Payment Receipt", 50, 58);

  doc.fillColor(DARK).fontSize(13).font("Helvetica-Bold").text("Receipt", 50, 120);
  doc.fillColor(MID_GRAY).fontSize(10).font("Helvetica")
    .text(`Receipt #${payment.id}`, 50, 138)
    .text(`Date: ${paymentDate}`, 50, 152);

  const tableTop = 195;
  doc.rect(50, tableTop, doc.page.width - 100, 30).fill(LIGHT_GRAY);
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica-Bold")
    .text("FIELD", 65, tableTop + 10)
    .text("DETAILS", 300, tableTop + 10);

  const rows: Array<[string, string]> = [
    ["Doctor Name",    doctor.nameEn],
    ["Plan",           planLabel],
    ["Amount",         `${payment.amount.toLocaleString("en-EG")} ${payment.currency}`],
    ["Payment Date",   paymentDate],
    ["Order ID",       payment.paymobOrderId ?? "—"],
    ["Transaction ID", payment.paymobTransactionId ?? "—"],
    ["Status",         "PAID"],
  ];

  let rowY = tableTop + 30;
  rows.forEach(([label, value], i) => {
    if (i % 2 === 1) doc.rect(50, rowY, doc.page.width - 100, 28).fill("#fafafa");
    doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica").text(label, 65, rowY + 9);
    doc.fillColor(DARK).fontSize(9).font("Helvetica").text(value, 300, rowY + 9, { width: doc.page.width - 370 });
    rowY += 28;
  });

  doc.rect(50, rowY, doc.page.width - 100, 1).fill("#e5e7eb");

  const footerY = doc.page.height - 70;
  doc.fillColor(MID_GRAY).fontSize(9).font("Helvetica")
    .text("Thank you for subscribing to EGY Doctors.", 50, footerY, { align: "center", width: doc.page.width - 100 })
    .text("This receipt is automatically generated and does not require a signature.", 50, footerY + 14, { align: "center", width: doc.page.width - 100 });

  doc.end();

  req.log.info({ doctorId: doctor.id, paymentId: payment.id }, "Payment receipt downloaded");
});

export default router;
