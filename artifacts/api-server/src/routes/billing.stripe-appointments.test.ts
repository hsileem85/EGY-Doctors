import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  rows: [] as unknown[],
  selectResults: [] as unknown[][],
  dbSelect: vi.fn(),
  proxy: vi.fn(),
}));

vi.mock("@replit/connectors-sdk", () => ({
  ReplitConnectors: class {
    proxy = state.proxy;
  },
}));

vi.mock("@workspace/db", async () => {
  const schema = await import("@workspace/db/schema");
  const chain = () => {
    const value = {
      from: () => value,
      innerJoin: () => value,
      leftJoin: () => value,
      where: () => value,
      limit: async () => state.rows,
    };
    return value;
  };
  state.dbSelect.mockImplementation(() => {
    const result = state.selectResults.shift() ?? state.rows;
    const query = chain();
    query.limit = async () => result;
    return query;
  });
  return { ...schema, db: { select: state.dbSelect } };
});

vi.mock("../lib/paymob.service.js", () => ({ dispatchPaymobRefund: vi.fn() }));
vi.mock("../lib/email", () => ({
  sendReceiptEmail: vi.fn(),
  sendAppointmentConfirmedEmail: vi.fn(),
  sendAppointmentCancelledEmail: vi.fn(),
}));

const { default: billingRouter } = await import("./billing");
const app = express();
app.use(express.json());
app.use("/api", billingRouter);
const secret = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const token = jwt.sign({ sub: 42, role: "patient" }, secret);

beforeEach(() => {
  state.rows = [];
  state.selectResults = [];
  state.dbSelect.mockClear();
  state.proxy.mockReset();
});

describe("Stripe appointment confirmation", () => {
  it("rejects a session whose metadata belongs to another patient", async () => {
    state.proxy.mockResolvedValue(new Response(JSON.stringify({
      id: "cs_test_owner", mode: "payment", payment_status: "paid",
      client_reference_id: "9", amount_total: 10000, currency: "egp",
      metadata: { payment_id: "9", appointment_id: "7", patient_user_id: "999" },
    }), { status: 200 }));

    const response = await request(app).post("/api/billing/stripe/appointments/confirm")
      .set("Authorization", `Bearer ${token}`).send({ sessionId: "cs_test_owner" });

    expect(response.status).toBe(403);
  });

  it("rejects a paid session with a mismatched amount", async () => {
    state.proxy.mockResolvedValue(new Response(JSON.stringify({
      id: "cs_test_amount", mode: "payment", payment_status: "paid",
      client_reference_id: "9", amount_total: 999, currency: "egp",
      metadata: { payment_id: "9", appointment_id: "7", patient_user_id: "42" },
    }), { status: 200 }));
    state.rows = [{
      payments: { id: 9, appointmentId: 7, paymobOrderId: "stripe:cs_test_amount", amount: 100, cashbackAmount: 0, currency: "EGP", status: "PENDING" },
      appointments: { id: 7, patientUserId: 42, status: "confirmed" },
    }];

    const response = await request(app).post("/api/billing/stripe/appointments/confirm")
      .set("Authorization", `Bearer ${token}`).send({ sessionId: "cs_test_amount" });

    expect([409, 500]).toContain(response.status);
  });

  it("requires authentication before contacting Stripe", async () => {
    const response = await request(app).post("/api/billing/stripe/appointments/confirm")
      .send({ sessionId: "cs_test_missing_auth" });
    expect(response.status).toBe(401);
    expect(state.proxy).not.toHaveBeenCalled();
  });

  it("returns CASH without creating a payment or escrow record", async () => {
    state.selectResults = [
      [{ id: 42, role: "patient", isActive: true }],
      [{ id: 7, patientUserId: 42, doctorId: 3, clinicId: 8, status: "confirmed", feeCharged: 100 }],
      [],
      [{ acceptedPaymentMethods: ["CASH", "WALLET", "FAWRY"] }],
      [],
    ];
    const response = await request(app).post("/api/appointments/7/payment")
      .set("Authorization", `Bearer ${token}`).send({ paymentMethod: "CASH" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: "CASH", paymentId: null });
    expect(state.dbSelect).toHaveBeenCalled();
  });
});