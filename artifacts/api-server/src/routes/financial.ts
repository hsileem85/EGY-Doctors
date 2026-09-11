import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { and, desc, eq, gte, sql, sum } from "drizzle-orm";
import { z } from "zod";
import {
  db, systemSettingsTable, bankAccountsTable, withdrawalRequestsTable,
  walletsTable, walletTransactionsTable,
  doctorsTable, paymentsTable,
} from "@workspace/db";
import { creditWallet, InsufficientWalletFundsError } from "../lib/wallet.service.js";

const router: IRouter = Router();
const nextDecision = (req: Request, res: Response) => (router as unknown as { handle: Function }).handle(req, res, () => undefined);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
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
  const [row] = await db.update(systemSettingsTable).set(parsed.data).where(eq(systemSettingsTable.id, 1)).returning();
  res.json(row ?? (await db.insert(systemSettingsTable).values({ id: 1, ...parsed.data }).returning())[0]);
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
      const [current] = await tx.select().from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.id, id)).limit(1);
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
export default router;