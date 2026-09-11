import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import express from "express";

const HMAC_SECRET = "test-hmac-secret-abc123";
process.env.PAYMOB_HMAC_SECRET = HMAC_SECRET;

vi.mock("../lib/logger", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

/* ── shared mock state (vi.hoisted so mock factory can close over it) ──────── */
const state = vi.hoisted(() => ({
  updatedPayment: null as Record<string, unknown> | null,
  doctor: null as Record<string, unknown> | null,
  txUpdateCallCount: 0,
  /** args passed to each tx.update(...).set(<here>) call, in order */
  capturedTxSets: [] as unknown[],
  /** args passed to db.update(...).set(<here>) (outside-transaction path) */
  capturedDbSets: [] as unknown[],
  recordSubscriptionFeeInTx: vi.fn(),
  recordSubscriptionRefundInTx: vi.fn(),
  escrowBookingInTx: vi.fn(),
  refundBookingEscrowInTx: vi.fn(),
  releaseBookingEscrowInTx: vi.fn(),
}));

vi.mock("../lib/wallet.service.js", () => ({
  recordSubscriptionFeeInTx: state.recordSubscriptionFeeInTx,
  recordSubscriptionRefundInTx: state.recordSubscriptionRefundInTx,
  escrowBookingInTx: state.escrowBookingInTx,
  refundBookingEscrowInTx: state.refundBookingEscrowInTx,
  releaseBookingEscrowInTx: state.releaseBookingEscrowInTx,
  centerSubtypeToWalletOwnerType: vi.fn(() => "MEDICAL_CENTER"),
}));

vi.mock("../lib/paymob.service.js", () => ({
  requestPaymobRefund: vi.fn(),
  dispatchPaymobRefund: vi.fn(),
}));

/* ── @workspace/db mock ─────────────────────────────────────────────────────── */
vi.mock("@workspace/db", () => ({
  db: {
    transaction: vi.fn().mockImplementation(
      async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
        state.txUpdateCallCount = 0;
        state.capturedTxSets = [];

        const tx = {
          update: vi.fn().mockImplementation(() => {
            state.txUpdateCallCount += 1;
            const callNum = state.txUpdateCallCount;
            // First update is for paymentsTable → return the payment record
            const terminalValue =
              callNum === 1 && state.updatedPayment ? [state.updatedPayment] : [];
            const chain: Record<string, (arg?: unknown) => unknown> = {};
            chain["set"] = (args: unknown) => {
              state.capturedTxSets.push(args);
              return chain;
            };
            chain["where"] = () => chain;
            chain["returning"] = () => Promise.resolve(terminalValue);
            return chain;
          }),
          select: vi.fn().mockImplementation(() => {
            const chain: Record<string, (arg?: unknown) => unknown> = {};
            chain["from"] = () => chain;
            chain["where"] = () => chain;
            chain["limit"] = () =>
              Promise.resolve(state.doctor ? [state.doctor] : []);
            return chain;
          }),
        };

        await cb(tx);
      }
    ),

    update: vi.fn().mockImplementation(() => {
      state.capturedDbSets = [];
      const chain: Record<string, (arg?: unknown) => unknown> = {};
      chain["set"] = (args: unknown) => {
        state.capturedDbSets.push(args);
        return chain;
      };
      chain["where"] = () => chain;
      return chain;
    }),

    select: vi.fn().mockImplementation(() => {
      const chain: Record<string, (arg?: unknown) => unknown> = {};
      chain["from"] = () => chain;
      chain["where"] = () => chain;
      chain["limit"] = () => Promise.resolve([]);
      return chain;
    }),
  },
  paymentsTable: { _: "payments" },
  doctorsTable: { _: "doctors" },
  siteSettingsTable: { _: "site_settings" },
  vouchersTable: { _: "vouchers" },
  appointmentsTable: { _: "appointments" },
}));

/* ── app setup ──────────────────────────────────────────────────────────────── */
const { default: billingRouter } = await import("./billing");
const app = express();
app.use(express.json());
app.use("/api", billingRouter);

/* ── HMAC helper — mirrors billing.ts field order exactly ───────────────────── */
function buildHmac(
  obj: Record<string, unknown>,
  order: Record<string, unknown>,
  sourceData: Record<string, unknown>,
  secret: string
): string {
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

  return crypto.createHmac("sha512", secret).update(fields).digest("hex");
}

function makeWebhookBody(overrides: Partial<Record<string, unknown>> = {}) {
  const order = { id: 99001 };
  const sourceData = { pan: "1234", sub_type: "MASTERCARD", type: "card" };
  const obj: Record<string, unknown> = {
    amount_cents: 80000,
    created_at: "2024-01-01T10:00:00.000Z",
    currency: "EGP",
    error_occured: false,
    has_parent_transaction: false,
    id: 55001,
    integration_id: 7777,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    owner: 1,
    pending: false,
    success: true,
    order,
    source_data: sourceData,
    ...overrides,
  };
  return { type: "TRANSACTION", obj };
}

/* ── tests ──────────────────────────────────────────────────────────────────── */
describe("POST /api/billing/paymob/webhook", () => {
  beforeEach(() => {
    state.updatedPayment = null;
    state.doctor = null;
    state.txUpdateCallCount = 0;
    state.capturedTxSets = [];
    state.capturedDbSets = [];
    state.recordSubscriptionFeeInTx.mockReset();
    state.recordSubscriptionRefundInTx.mockReset();
    state.escrowBookingInTx.mockReset();
    state.refundBookingEscrowInTx.mockReset();
    state.releaseBookingEscrowInTx.mockReset();
    vi.clearAllMocks();
  });

  /* ── Test 1: Wrong HMAC → 401, DB untouched ────────────────────────────── */
  it("returns 401 and makes no DB calls when HMAC is wrong", async () => {
    const { db } = await import("@workspace/db");
    const body = makeWebhookBody();

    const res = await request(app)
      .post("/api/billing/paymob/webhook?hmac=deadbeef0000")
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: "Invalid HMAC" });
    expect(db.transaction).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  /* ── Test 2: Correct HMAC + success → payment PAID + subscription ACTIVE ── */
  it("marks payment as PAID and activates doctor subscription on successful payment", async () => {
    const body = makeWebhookBody();
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);

    // Configure what the mocked DB returns so the handler proceeds fully
    state.updatedPayment = {
      id: 1,
      doctorId: 42,
      planType: "MONTHS_3",
      voucherCode: null,
      amount: 800,
    };
    state.doctor = { id: 42, subscriptionEndDate: null };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send({ type: "TRANSACTION", obj })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);

    // Payment record must be updated to PAID with a paidAt timestamp
    const paymentUpdate = state.capturedTxSets[0] as Record<string, unknown>;
    expect(paymentUpdate).toMatchObject({ status: "PAID" });
    expect(paymentUpdate["paymobTransactionId"]).toBe("55001");
    expect(paymentUpdate["paidAt"]).toBeInstanceOf(Date);

    // Doctor subscription must be activated
    const doctorUpdate = state.capturedTxSets[1] as Record<string, unknown>;
    expect(doctorUpdate).toMatchObject({
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "MONTHS_3",
    });
    expect(doctorUpdate["subscriptionEndDate"]).toBeInstanceOf(Date);
    expect(state.recordSubscriptionFeeInTx).toHaveBeenCalledOnce();
    expect(state.recordSubscriptionFeeInTx).toHaveBeenCalledWith(
      expect.anything(),
      { amount: 800, paymentId: "1" },
    );
  });

  /* ── Test 3: Correct HMAC + failure → payment FAILED, no activation ─────── */
  it("marks payment as FAILED without activating subscription on failed payment", async () => {
    const body = makeWebhookBody({ success: false });
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);

    const { db } = await import("@workspace/db");

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);

    // Must mark the payment FAILED
    const failedUpdate = state.capturedDbSets[0] as Record<string, unknown>;
    expect(failedUpdate).toMatchObject({ status: "FAILED" });
    expect(failedUpdate["paymobTransactionId"]).toBe("55001");

    // No subscription activation should have run
    expect(db.transaction).not.toHaveBeenCalled();
    expect(state.capturedTxSets).toHaveLength(0);
  });

  /* ── Test 4: Non-TRANSACTION type is silently ignored ────────────────────── */
  it("returns 200 without any DB call for non-TRANSACTION webhook types", async () => {
    const body = makeWebhookBody();
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);

    const { db } = await import("@workspace/db");

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send({ type: "TOKEN", obj })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(db.transaction).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  /* ── Test 5: Missing hmac query param → 401 ─────────────────────────────── */
  it("returns 401 when no hmac query parameter is provided", async () => {
    const { db } = await import("@workspace/db");
    const body = makeWebhookBody();

    const res = await request(app)
      .post("/api/billing/paymob/webhook")
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(401);
    expect(db.transaction).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("does not create another subscription ledger entry when a paid webhook is replayed", async () => {
    const body = makeWebhookBody();
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);

    state.updatedPayment = null;
    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.recordSubscriptionFeeInTx).not.toHaveBeenCalled();
  });

  it("records a subscription refund once when Paymob reports a refund", async () => {
    const body = makeWebhookBody({ is_refunded: true });
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);

    state.updatedPayment = {
      id: 1,
      doctorId: 42,
      planType: "MONTHS_3",
      voucherCode: null,
      amount: 800,
    };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.recordSubscriptionRefundInTx).toHaveBeenCalledOnce();
    expect(state.recordSubscriptionRefundInTx).toHaveBeenCalledWith(
      expect.anything(),
      { amount: 800, paymentId: "1" },
    );
    expect(state.recordSubscriptionFeeInTx).not.toHaveBeenCalled();
  });

  it("escrows a verified booking payment into its stored wallet snapshot", async () => {
    const body = makeWebhookBody();
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);
    state.updatedPayment = {
      id: 9,
      appointmentId: 77,
      escrowOwnerType: "DOCTOR",
      escrowOwnerId: "314",
      planType: "BOOKING",
      amount: 450,
      voucherCode: null,
    };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.escrowBookingInTx).toHaveBeenCalledWith(
      expect.anything(),
      { ownerType: "DOCTOR", ownerId: "314", amount: 450, bookingId: "77" },
    );
    expect(state.recordSubscriptionFeeInTx).not.toHaveBeenCalled();
  });

  it("settles a booking that was completed before its successful webhook arrived", async () => {
    const body = makeWebhookBody();
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);
    state.updatedPayment = {
      id: 11,
      appointmentId: 79,
      escrowOwnerType: "DOCTOR",
      escrowOwnerId: "314",
      planType: "BOOKING",
      amount: 500,
      cashbackAmount: 0,
      voucherCode: null,
    };
    state.doctor = { status: "completed", patientUserId: 9001 };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send({ type: "TRANSACTION", obj })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.escrowBookingInTx).toHaveBeenCalledWith(
      expect.anything(),
      { ownerType: "DOCTOR", ownerId: "314", amount: 500, bookingId: "79" },
    );
    expect(state.releaseBookingEscrowInTx).toHaveBeenCalledWith(
      expect.anything(),
      {
        ownerType: "DOCTOR",
        ownerId: "314",
        amount: 500,
        bookingId: "79",
        commissionRate: 0.1,
        patientUserId: "9001",
      },
    );
  });

  it("refunds booking escrow from the original wallet snapshot", async () => {
    const body = makeWebhookBody({ is_refunded: true });
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);
    state.updatedPayment = {
      id: 9,
      appointmentId: 77,
      escrowOwnerType: "MEDICAL_CENTER",
      escrowOwnerId: "501",
      planType: "BOOKING",
      amount: 450,
      escrowedAt: new Date(),
    };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.refundBookingEscrowInTx).toHaveBeenCalledWith(
      expect.anything(),
      { ownerType: "MEDICAL_CENTER", ownerId: "501", amount: 450, bookingId: "77" },
    );
    expect(state.recordSubscriptionRefundInTx).not.toHaveBeenCalled();
  });

  it("does not debit any wallet when a cancelled booking is refunded before escrow", async () => {
    const body = makeWebhookBody({ is_refunded: true });
    const obj = body.obj;
    const order = obj["order"] as Record<string, unknown>;
    const sourceData = obj["source_data"] as Record<string, unknown>;
    const hmac = buildHmac(obj, order, sourceData, HMAC_SECRET);
    state.updatedPayment = {
      id: 10,
      appointmentId: 78,
      escrowOwnerType: "DOCTOR",
      escrowOwnerId: "314",
      planType: "BOOKING",
      amount: 450,
      escrowedAt: null,
    };

    const res = await request(app)
      .post(`/api/billing/paymob/webhook?hmac=${hmac}`)
      .send(body)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(state.refundBookingEscrowInTx).not.toHaveBeenCalled();
    expect(state.recordSubscriptionRefundInTx).not.toHaveBeenCalled();
  });
});
