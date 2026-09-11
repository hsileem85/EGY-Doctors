import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getWalletWithTransactions = vi.hoisted(() => vi.fn());

vi.mock("../lib/wallet.service.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/wallet.service.js")>();
  return {
    ...actual,
    getWalletWithTransactions,
  };
});

const { default: walletRouter } = await import("./wallet");

const app = express();
app.use(express.json());
app.use("/api", walletRouter);

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-in-prod";
const walletId = "3f6a1bf8-9791-4c42-aa1e-44954a5b9f15";
const transactionId = "ad50dbfc-84bb-401a-9ff4-4f75a4ebc487";

function tokenFor(sub: number, role: string) {
  return jwt.sign({ sub, role }, JWT_SECRET);
}

beforeEach(() => {
  getWalletWithTransactions.mockReset();
});

describe("GET /api/wallet", () => {
  it("returns the platform wallet, balances, and transaction history to an admin", async () => {
    getWalletWithTransactions.mockResolvedValue({
      id: walletId,
      ownerType: "PLATFORM",
      ownerId: "SYSTEM_REVENUE",
      balance: 875.5,
      pendingFunds: 125,
      currency: "EGP",
      transactions: [{
        id: transactionId,
        type: "CREDIT",
        category: "PLATFORM_COMMISSION",
        amount: 75.5,
        balancePost: 875.5,
        pendingFundsPost: 125,
        referenceId: "booking-42",
        description: "Platform commission",
        createdAt: new Date("2026-09-11T08:30:00.000Z"),
      }],
    });

    const response = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${tokenFor(7, "admin")}`);

    expect(response.status).toBe(200);
    expect(getWalletWithTransactions).toHaveBeenCalledWith(
      "PLATFORM",
      "SYSTEM_REVENUE",
    );
    expect(response.body).toMatchObject({
      id: walletId,
      ownerType: "PLATFORM",
      ownerId: "SYSTEM_REVENUE",
      balance: 875.5,
      pendingFunds: 125,
      currency: "EGP",
      transactions: [{
        id: transactionId,
        type: "CREDIT",
        category: "PLATFORM_COMMISSION",
        amount: 75.5,
        balancePost: 875.5,
        referenceId: "booking-42",
        description: "Platform commission",
        createdAt: "2026-09-11T08:30:00.000Z",
      }],
    });
  });

  it.each([
    { role: "patient", ownerType: "PATIENT" },
    { role: "doctor", ownerType: "DOCTOR" },
  ])("returns only the authenticated $role wallet", async ({ role, ownerType }) => {
    getWalletWithTransactions.mockResolvedValue({
      id: walletId,
      ownerType,
      ownerId: "31",
      balance: 20,
      pendingFunds: 0,
      currency: "EGP",
      transactions: [],
    });

    const response = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${tokenFor(31, role)}`);

    expect(response.status).toBe(200);
    expect(getWalletWithTransactions).toHaveBeenCalledWith(ownerType, "31");
    expect(getWalletWithTransactions).not.toHaveBeenCalledWith(
      "PLATFORM",
      "SYSTEM_REVENUE",
    );
    expect(response.body).toMatchObject({
      ownerType,
      ownerId: "31",
      balance: 20,
      pendingFunds: 0,
      transactions: [],
    });
  });

  it.each([
    ["a missing token", undefined],
    ["an invalid token", "Bearer not-a-valid-token"],
  ])("rejects unauthorized requests with %s", async (_label, authorization) => {
    const pendingRequest = request(app).get("/api/wallet");
    const response = authorization
      ? await pendingRequest.set("Authorization", authorization)
      : await pendingRequest;

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
    expect(getWalletWithTransactions).not.toHaveBeenCalled();
  });

  it("does not expose the platform wallet to an unsupported authenticated role", async () => {
    const response = await request(app)
      .get("/api/wallet")
      .set("Authorization", `Bearer ${tokenFor(31, "support")}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "This account type does not have a wallet",
    });
    expect(getWalletWithTransactions).not.toHaveBeenCalled();
  });
});