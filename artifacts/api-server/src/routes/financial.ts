import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import { z } from "zod";
import {
  db, systemSettingsTable, bankAccountsTable, withdrawalRequestsTable,
  walletsTable, walletTransactionsTable,
  doctorsTable, paymentsTable,
} from "@workspace/db";
import { creditWallet, ensureWallet, InsufficientWalletFundsError, notifyDoctorLowBalanceCrossingInTx } from "../lib/wallet.service.js";

const router: IRouter = Router();
const nextDecision = (req: Request, res: Response) => (router as unknown as { handle: Function }).handle(req, res, () => undefined);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const connectors = new ReplitConnectors();
type Auth = { sub: number; role: string };

function auth(req: Request): Auth | null {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  try { return jwt.verify(h.slice(7), JWT_SECRET) as unknown as Auth; } catch { return null; }
}
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const p = auth(req);
  if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "admin") { res.status(403).json({ error: "Forbidden" }); return; }
  next();
}
const settingsInput = z.object({
  deductionType: z.enum(["FIXED", "PERCENTAGE"]),
  deductionValue: z.number().finite().min(0),
  platformSharePercentage: z.number().finite().min(0).max(100),
  cashbackSharePercentage: z.number().finite().min(0).max(100),
  minDoctorWalletBalance: z.number().finite().min(0),
  subscriptionModelEnabled: z.boolean(),
  reviewPromptDelayHours: z.number().finite().int().min(0).max(720).optional(),
  reviewCashbackAmount: z.number().finite().min(0).max(100000).optional(),
}).refine((v) => v.platformSharePercentage + v.cashbackSharePercentage === 100,
  "Platform and cashback shares must total 100");
const bankInput = z.object({
  accountHolderName: z.string().trim().min(1),
  bankName: z.string().trim().min(1),
  accountNumber: z.string().nullable().optional(),
  iban: z.string().nullable().optional(),
  branchName: z.string().nullable().optional(),
  swiftCode: z.string().nullable().optional(),
});

async function settings() {
  const [row] = await db.select().from(systemSettingsTable).where(eq(systemSettingsTable.id, 1));
  return row ?? (await db.insert(systemSettingsTable).values({ id: 1 }).returning())[0];
}
async function upsertBank(ownerType: string, ownerId: string, data: z.infer<typeof bankInput>) {
  const [row] = await db.insert(bankAccountsTable).values({ ownerType, ownerId, ...data })
    .onConflictDoUpdate({ target: [bankAccountsTable.ownerType, bankAccountsTable.ownerId], set: data })
    .returning();
  return row;
}

router.get("/admin/financial-settings", requireAdmin, async (_req, res) => res.json(await settings()));
router.patch("/admin/financial-settings", requireAdmin, async (req, res) => {
  const parsed = settingsInput.safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  const data = { ...parsed.data, minDoctorWalletBalance: 50, subscriptionModelEnabled: false };
  const [row] = await db.update(systemSettingsTable).set(data).where(eq(systemSettingsTable.id, 1)).returning();
  res.json(row ?? (await db.insert(systemSettingsTable).values({ id: 1, ...data }).returning())[0]);
});

router.get("/wallet/bank-account", async (req, res) => {
  const p = auth(req); if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.select().from(bankAccountsTable).where(and(eq(bankAccountsTable.ownerType, "DOCTOR"), eq(bankAccountsTable.ownerId, String(p.sub))));
  if (!row) { res.status(404).json({ error: "Bank account not found" }); return; } res.json(row);
});
router.put("/wallet/bank-account", async (req, res) => {
  const p = auth(req); if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "doctor") { res.status(403).json({ error: "Only doctors may set a withdrawal account" }); return; }
  const parsed = bankInput.safeParse(req.body); if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  res.json(await upsertBank("DOCTOR", String(p.sub), parsed.data));
});
router.get("/admin/platform-bank-account", requireAdmin, async (_req, res) => {
  const [row] = await db.select().from(bankAccountsTable).where(and(eq(bankAccountsTable.ownerType, "PLATFORM"), eq(bankAccountsTable.ownerId, "SYSTEM_REVENUE")));
  if (!row) { res.status(404).json({ error: "Bank account not found" }); return; } res.json(row);
});
router.put("/admin/platform-bank-account", requireAdmin, async (req, res) => {
  const parsed = bankInput.safeParse(req.body); if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  res.json(await upsertBank("PLATFORM", "SYSTEM_REVENUE", parsed.data));
});

router.post(["/wallet/withdrawals", "/wallet/withdraw"], async (req, res) => {
  const p = auth(req); if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "doctor") { res.status(403).json({ error: "Only doctors may withdraw" }); return; }
  const parsed = z.object({ amount: z.number().finite().positive() }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  const [bank] = await db.select().from(bankAccountsTable).where(and(eq(bankAccountsTable.ownerType, "DOCTOR"), eq(bankAccountsTable.ownerId, String(p.sub))));
  if (!bank) { res.status(400).json({ error: "Bank account is required" }); return; }
  const row = await db.transaction(async (tx) => {
    const [pending] = await tx.select({ total: sum(withdrawalRequestsTable.amount) }).from(withdrawalRequestsTable)
      .where(and(eq(withdrawalRequestsTable.doctorUserId, String(p.sub)), eq(withdrawalRequestsTable.status, "PENDING")));
    const reserved = Number(pending?.total ?? 0);
    const [wallet] = await tx.update(walletsTable).set({ updatedAt: new Date() })
      .where(and(eq(walletsTable.ownerType, "DOCTOR"), eq(walletsTable.ownerId, String(p.sub)), gte(walletsTable.balance, reserved + parsed.data.amount)))
      .returning();
    if (!wallet) throw new Error("Insufficient wallet funds");
    return (await tx.insert(withdrawalRequestsTable).values({ doctorUserId: String(p.sub), amount: parsed.data.amount, bankAccountId: bank.id }).returning())[0];
  }).catch(() => null);
  if (!row) { res.status(400).json({ error: "Insufficient wallet funds" }); return; }
  res.status(201).json(row);
});
router.get("/admin/withdrawal-requests", requireAdmin, async (_req, res) => {
  res.json(await db.select().from(withdrawalRequestsTable).orderBy(desc(withdrawalRequestsTable.createdAt)));
});
router.post("/admin/withdrawal-requests/:id/decision", requireAdmin, async (req, res) => {
  const parsed = z.object({ decision: z.enum(["APPROVED", "REJECTED", "COMPLETED"]), adminNote: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const row = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(withdrawalRequestsTable)
        .where(eq(withdrawalRequestsTable.id, id))
        .limit(1)
        .for("update");
      if (!current) return null;
      if (parsed.data.decision === "REJECTED") {
        if (current.status === "COMPLETED") return current;
        return (await tx.update(withdrawalRequestsTable).set({ status: "REJECTED", adminNote: parsed.data.adminNote ?? null }).where(eq(withdrawalRequestsTable.id, id)).returning())[0];
      }
      if (current.status === "COMPLETED") return current;
      if (parsed.data.decision === "APPROVED") return (await tx.update(withdrawalRequestsTable).set({ status: "APPROVED", adminNote: parsed.data.adminNote ?? null }).where(eq(withdrawalRequestsTable.id, id)).returning())[0];
      const [wallet] = await tx.update(walletsTable).set({
        balance: sql`${walletsTable.balance} - ${current.amount}`,
        updatedAt: new Date(),
      }).where(and(
        eq(walletsTable.ownerType, "DOCTOR"),
        eq(walletsTable.ownerId, current.doctorUserId),
        gte(walletsTable.balance, current.amount),
      )).returning();
      if (!wallet) throw new InsufficientWalletFundsError();
      await notifyDoctorLowBalanceCrossingInTx(
        tx,
        current.doctorUserId,
        wallet.balance + current.amount,
        wallet.balance,
      );
      await tx.insert(walletTransactionsTable).values({
        walletId: wallet.id, type: "DEBIT", category: "WITHDRAWAL_PAYOUT",
        amount: current.amount, balancePost: wallet.balance,
        referenceId: current.id, description: "Doctor withdrawal payout",
      });
      return (await tx.update(withdrawalRequestsTable).set({ status: "COMPLETED", completedAt: new Date(), adminNote: parsed.data.adminNote ?? null }).where(eq(withdrawalRequestsTable.id, id)).returning())[0];
    });
    if (!row) { res.status(404).json({ error: "Withdrawal request not found" }); return; }
    res.json(row);
  } catch (e) {
    if (e instanceof InsufficientWalletFundsError) { res.status(409).json({ error: e.message }); return; }
    throw e;
  }
});
router.post(["/admin/withdrawal-requests/:id/approve", "/admin/withdrawals/:id/approve"], requireAdmin, (req, _res, next) => {
  req.body = { ...(req.body ?? {}), decision: "APPROVED" }; next();
}, async (req, res) => {
  req.url = req.url.replace(/\/approve$/, "/decision");
  nextDecision(req, res);
});
router.post(["/admin/withdrawal-requests/:id/reject", "/admin/withdrawals/:id/reject"], requireAdmin, (req, _res, next) => {
  req.body = { ...(req.body ?? {}), decision: "REJECTED" }; next();
}, async (req, res) => {
  if (!req.body.adminNote?.trim()) { res.status(422).json({ error: "Rejection note is required" }); return; }
  req.url = req.url.replace(/\/reject$/, "/decision");
  nextDecision(req, res);
});
router.post(["/admin/wallet-gifts", "/admin/wallet/gift"], requireAdmin, async (req, res) => {
  const parsed = z.object({ doctorUserId: z.string().min(1), amount: z.number().finite().positive(), description: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  const result = await creditWallet({ ownerType: "DOCTOR", ownerId: parsed.data.doctorUserId, amount: parsed.data.amount, category: "ADMIN_GIFT", description: parsed.data.description ?? "Administrative wallet gift" });
  res.json(result);
});
router.post("/wallet/top-ups", async (req, res) => {
  const p = auth(req); if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "doctor") { res.status(403).json({ error: "Only doctors may top up this wallet" }); return; }
  const parsed = z.object({ amount: z.number().finite().positive(), paymentMethod: z.enum(["card", "fawry", "wallet"]) }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: parsed.error.message }); return; }
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = parsed.data.paymentMethod === "card" ? process.env.PAYMOB_CARD_INTEGRATION_ID
    : parsed.data.paymentMethod === "fawry" ? process.env.PAYMOB_FAWRY_INTEGRATION_ID : process.env.PAYMOB_WALLET_INTEGRATION_ID;
  const iframeId = parsed.data.paymentMethod === "card" ? process.env.PAYMOB_IFRAME_ID
    : parsed.data.paymentMethod === "fawry" ? process.env.PAYMOB_FAWRY_IFRAME_ID : process.env.PAYMOB_WALLET_IFRAME_ID;
  if (!apiKey || !integrationId || !iframeId) { res.status(503).json({ error: "Wallet top-up gateway is not configured" }); return; }
  const [doctor] = await db.select({ id: doctorsTable.id }).from(doctorsTable).where(eq(doctorsTable.userId, p.sub)).limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }
  try {
    const base = "https://accept.paymob.com/api";
    const authResponse = await fetch(`${base}/auth/tokens`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey }) });
    if (!authResponse.ok) throw new Error("Paymob auth failed");
    const { token } = await authResponse.json() as { token: string };
    const cents = Math.round(parsed.data.amount * 100);
    const orderResponse = await fetch(`${base}/ecommerce/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      auth_token: token, delivery_needed: false, amount_cents: cents, currency: "EGP",
      items: [{ name: "EGY Doctors wallet top-up", amount_cents: cents, description: `wallet-top-up-${p.sub}`, quantity: 1 }],
    }) });
    if (!orderResponse.ok) throw new Error("Paymob order failed");
    const order = await orderResponse.json() as { id: number };
    const keyResponse = await fetch(`${base}/acceptance/payment_keys`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      auth_token: token, amount_cents: cents, expiration: 3600, order_id: order.id, currency: "EGP",
      integration_id: Number(integrationId), lock_order_when_paid: true,
      billing_data: { apartment: "NA", email: "NA", floor: "NA", first_name: "Doctor", street: "NA", building: "NA", phone_number: "NA", shipping_method: "NA", postal_code: "NA", city: "Cairo", country: "EG", last_name: "NA", state: "NA" },
    }) });
    if (!keyResponse.ok) throw new Error("Paymob payment key failed");
    const key = await keyResponse.json() as { token: string };
    const [payment] = await db.insert(paymentsTable).values({
      doctorId: doctor.id, paymobOrderId: String(order.id), planType: "WALLET_TOP_UP",
      amount: parsed.data.amount, currency: "EGP", status: "PENDING",
    }).returning();
    res.json({ paymentKey: key.token, iframeId, orderId: String(order.id), paymentId: payment.id, iframeUrl: `${base}/acceptance/iframes/${iframeId}?payment_token=${key.token}` });
  } catch (error) {
    req.log.error({ error }, "Wallet top-up Paymob initiation failed");
    res.status(502).json({ error: "Failed to initiate wallet top-up" });
  }
});

router.post("/wallet/top-ups/stripe", async (req, res) => {
  const p = auth(req);
  if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "doctor") { res.status(403).json({ error: "Only doctors may top up this wallet" }); return; }

  const parsed = z.object({
    amount: z.number().finite().min(50).max(100_000),
  }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Enter an amount between 50 and 100,000 EGP" }); return; }

  const amount = Math.round(parsed.data.amount * 100) / 100;
  const amountMinor = Math.round(amount * 100);
  const [doctor] = await db.select({ id: doctorsTable.id })
    .from(doctorsTable)
    .where(eq(doctorsTable.userId, p.sub))
    .limit(1);
  if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }

  const pendingReference = `stripe:pending:${crypto.randomUUID()}`;
  const [payment] = await db.insert(paymentsTable).values({
    doctorId: doctor.id,
    paymobOrderId: pendingReference,
    planType: "WALLET_TOP_UP",
    amount,
    currency: "EGP",
    status: "PENDING",
  }).returning();

  try {
    const host = req.get("host");
    if (!host) throw new Error("Missing request host");
    const origin = host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? `${req.protocol}://${host}`
      : `https://${host}`;
    const form = new URLSearchParams({
      mode: "payment",
      success_url: `${origin}/billing/payment-result?kind=wallet_top_up&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/payment-result?kind=wallet_top_up&provider=stripe&cancelled=true`,
      client_reference_id: String(payment.id),
      "line_items[0][price_data][currency]": "egp",
      "line_items[0][price_data][product_data][name]": "EGY Doctors wallet top-up",
      "line_items[0][price_data][unit_amount]": String(amountMinor),
      "line_items[0][quantity]": "1",
      "metadata[payment_id]": String(payment.id),
      "metadata[doctor_user_id]": String(p.sub),
      "payment_intent_data[metadata][payment_id]": String(payment.id),
      "payment_intent_data[metadata][doctor_user_id]": String(p.sub),
    });
    const response = await connectors.proxy("stripe", "/v1/checkout/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const session = await response.json() as { id?: string; url?: string; error?: { message?: string } };
    if (!response.ok || !session.id || !session.url) {
      throw new Error(session.error?.message ?? `Stripe checkout failed (${response.status})`);
    }
    await db.update(paymentsTable)
      .set({ paymobOrderId: `stripe:${session.id}` })
      .where(and(eq(paymentsTable.id, payment.id), eq(paymentsTable.paymobOrderId, pendingReference)));
    res.json({ checkoutUrl: session.url, sessionId: session.id, paymentId: payment.id });
  } catch (error) {
    await db.update(paymentsTable)
      .set({ status: "FAILED" })
      .where(and(eq(paymentsTable.id, payment.id), eq(paymentsTable.status, "PENDING")));
    req.log.error({ error, paymentId: payment.id }, "Stripe wallet top-up initiation failed");
    res.status(502).json({ error: "Failed to initiate Stripe checkout" });
  }
});

router.post("/wallet/top-ups/stripe/confirm", async (req, res) => {
  const p = auth(req);
  if (!p) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (p.role !== "doctor") { res.status(403).json({ error: "Only doctors may confirm this wallet top-up" }); return; }
  const parsed = z.object({ sessionId: z.string().regex(/^cs_(test|live)_/) }).safeParse(req.body);
  if (!parsed.success) { res.status(422).json({ error: "Invalid Stripe checkout session" }); return; }

  try {
    const response = await connectors.proxy("stripe", `/v1/checkout/sessions/${encodeURIComponent(parsed.data.sessionId)}`);
    const session = await response.json() as {
      id?: string;
      payment_status?: string;
      payment_intent?: string | null;
      amount_total?: number | null;
      currency?: string | null;
      metadata?: Record<string, string>;
      error?: { message?: string };
    };
    if (!response.ok) throw new Error(session.error?.message ?? `Stripe verification failed (${response.status})`);
    if (session.id !== parsed.data.sessionId || session.payment_status !== "paid") {
      res.status(409).json({ status: "PENDING", error: "Stripe payment is not complete" });
      return;
    }

    const paymentId = Number(session.metadata?.payment_id);
    if (!Number.isInteger(paymentId) || session.metadata?.doctor_user_id !== String(p.sub)) {
      res.status(403).json({ error: "Stripe session does not belong to this doctor" });
      return;
    }

    const [doctor] = await db.select({ id: doctorsTable.id })
      .from(doctorsTable)
      .where(eq(doctorsTable.userId, p.sub))
      .limit(1);
    if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return; }
    await ensureWallet("DOCTOR", String(p.sub));

    let status: "PAID" | "PENDING" = "PENDING";
    await db.transaction(async (tx) => {
      const [updated] = await tx.update(paymentsTable).set({
        status: "PAID",
        paymobTransactionId: session.payment_intent ?? session.id,
        paidAt: new Date(),
      }).where(and(
        eq(paymentsTable.id, paymentId),
        eq(paymentsTable.doctorId, doctor.id),
        eq(paymentsTable.paymobOrderId, `stripe:${session.id}`),
        eq(paymentsTable.planType, "WALLET_TOP_UP"),
        eq(paymentsTable.status, "PENDING"),
      )).returning();

      if (!updated) {
        const [existing] = await tx.select({ status: paymentsTable.status })
          .from(paymentsTable)
          .where(and(
            eq(paymentsTable.id, paymentId),
            eq(paymentsTable.doctorId, doctor.id),
            eq(paymentsTable.paymobOrderId, `stripe:${session.id}`),
          ))
          .limit(1);
        if (existing?.status === "PAID") status = "PAID";
        return;
      }

      if (
        session.currency?.toUpperCase() !== updated.currency ||
        session.amount_total !== Math.round(updated.amount * 100)
      ) {
        throw new Error("Stripe payment amount does not match the wallet top-up");
      }

      const [wallet] = await tx.update(walletsTable).set({
        balance: sql`${walletsTable.balance} + ${updated.amount}`,
        updatedAt: new Date(),
      }).where(and(
        eq(walletsTable.ownerType, "DOCTOR"),
        eq(walletsTable.ownerId, String(p.sub)),
      )).returning();
      if (!wallet) throw new Error("Doctor wallet not found");

      await tx.insert(walletTransactionsTable).values({
        walletId: wallet.id,
        type: "CREDIT",
        category: "WALLET_TOP_UP",
        amount: updated.amount,
        balancePost: wallet.balance,
        referenceId: `stripe:${session.id}`,
        description: "Verified Stripe wallet top-up",
      });
      status = "PAID";
    });

    res.json({ status });
  } catch (error) {
    req.log.error({ error, sessionId: parsed.data.sessionId }, "Stripe wallet top-up confirmation failed");
    res.status(502).json({ error: "Failed to verify Stripe payment" });
  }
});
export default router;