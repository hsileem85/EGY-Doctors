import crypto from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  walletsTable,
  walletTransactionsTable,
  type WalletTransaction,
} from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  InsufficientWalletFundsError,
  creditWallet,
  debitWallet,
  ensureWallet,
  escrowFunds,
  releaseBookingEscrowInTx,
  releaseEscrow,
  calculateFinancialSplit,
} from "./wallet.service.js";

const PLATFORM_OWNER_ID = "SYSTEM_REVENUE";
const testOwnerIds = new Set<string>();
const testReferenceIds = new Set<string>();

describe("financial split invariants", () => {
  it("splits a fixed total deduction, not the post-deduction amount", () => {
    expect(calculateFinancialSplit(1000, {
      deductionType: "FIXED", deductionValue: 100,
      platformSharePercentage: 60, cashbackSharePercentage: 40,
    })).toEqual({ deduction: 100, platformShare: 60, cashbackShare: 40 });
  });
  it("splits a percentage deduction from gross", () => {
    expect(calculateFinancialSplit(1000, {
      deductionType: "PERCENTAGE", deductionValue: 10,
      platformSharePercentage: 50, cashbackSharePercentage: 50,
    })).toEqual({ deduction: 100, platformShare: 50, cashbackShare: 50 });
  });
});

function uniqueId(label: string) {
  return `wallet-test-${label}-${crypto.randomUUID()}`;
}

async function createDoctorWallet(label: string, balance = 0) {
  const ownerId = uniqueId(label);
  testOwnerIds.add(ownerId);
  const wallet = await ensureWallet("DOCTOR", ownerId);

  if (balance > 0) {
    await creditWallet({
      ownerType: "DOCTOR",
      ownerId,
      amount: balance,
      category: "BOOKING_PAYMENT",
      referenceId: uniqueId("setup-credit"),
      description: "Wallet integration test setup",
    });
  }

  return { ...wallet, ownerId };
}

async function getWallet(ownerId: string) {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.ownerType, "DOCTOR"), eq(walletsTable.ownerId, ownerId)))
    .limit(1);
  return wallet;
}

async function getTransactions(walletId: string): Promise<WalletTransaction[]> {
  return db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.walletId, walletId));
}

afterEach(async () => {
  const references = [...testReferenceIds];
  if (references.length > 0) {
    await db.transaction(async (tx) => {
      const [platform] = await tx
        .select({ id: walletsTable.id })
        .from(walletsTable)
        .where(and(
          eq(walletsTable.ownerType, "PLATFORM"),
          eq(walletsTable.ownerId, PLATFORM_OWNER_ID),
        ))
        .limit(1);

      if (platform) {
        const platformEntries = await tx
          .select({ amount: walletTransactionsTable.amount })
          .from(walletTransactionsTable)
          .where(and(
            eq(walletTransactionsTable.walletId, platform.id),
            inArray(walletTransactionsTable.referenceId, references),
          ));
        const creditedAmount = platformEntries.reduce((sum, entry) => sum + entry.amount, 0);

        await tx
          .delete(walletTransactionsTable)
          .where(and(
            eq(walletTransactionsTable.walletId, platform.id),
            inArray(walletTransactionsTable.referenceId, references),
          ));

        if (creditedAmount > 0) {
          await tx
            .update(walletsTable)
            .set({ balance: sql`${walletsTable.balance} - ${creditedAmount}` })
            .where(eq(walletsTable.id, platform.id));
        }
      }
    });
  }

  const ownerIds = [...testOwnerIds];
  if (ownerIds.length > 0) {
    await db.delete(walletsTable).where(inArray(walletsTable.ownerId, ownerIds));
  }
  testOwnerIds.clear();
  testReferenceIds.clear();
});

afterAll(async () => {
  await pool.end();
});

describe.sequential("wallet service database guarantees", () => {
  it("records credit and debit ledger entries with their resulting balances", async () => {
    const { ownerId } = await createDoctorWallet("credit-debit");
    const creditReference = uniqueId("credit");
    const debitReference = uniqueId("debit");

    const credited = await creditWallet({
      ownerType: "DOCTOR",
      ownerId,
      amount: 125.5,
      category: "BOOKING_PAYMENT",
      referenceId: creditReference,
      description: "Test credit",
    });
    const debited = await debitWallet({
      ownerType: "DOCTOR",
      ownerId,
      amount: 25.25,
      category: "WITHDRAWAL_PAYOUT",
      referenceId: debitReference,
      description: "Test debit",
    });

    expect(credited.wallet.balance).toBe(125.5);
    expect(credited.transaction).toMatchObject({
      type: "CREDIT",
      category: "BOOKING_PAYMENT",
      amount: 125.5,
      balancePost: 125.5,
      referenceId: creditReference,
    });
    expect(debited.wallet.balance).toBe(100.25);
    expect(debited.transaction).toMatchObject({
      type: "DEBIT",
      category: "WITHDRAWAL_PAYOUT",
      amount: 25.25,
      balancePost: 100.25,
      referenceId: debitReference,
    });
  });

  it("allows only one simultaneous debit when both attempts would overdraw the wallet", async () => {
    const { ownerId } = await createDoctorWallet("concurrent-debit", 100);

    const results = await Promise.allSettled([
      debitWallet({
        ownerType: "DOCTOR",
        ownerId,
        amount: 80,
        category: "WITHDRAWAL_PAYOUT",
        referenceId: uniqueId("concurrent-a"),
        description: "Concurrent debit A",
      }),
      debitWallet({
        ownerType: "DOCTOR",
        ownerId,
        amount: 80,
        category: "WITHDRAWAL_PAYOUT",
        referenceId: uniqueId("concurrent-b"),
        description: "Concurrent debit B",
      }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: expect.any(InsufficientWalletFundsError),
    });

    const wallet = await getWallet(ownerId);
    expect(wallet.balance).toBe(20);
    const debits = (await getTransactions(wallet.id))
      .filter((entry) => entry.type === "DEBIT");
    expect(debits).toHaveLength(1);
    expect(debits[0]).toMatchObject({ amount: 80, balancePost: 20 });
  });

  it("rejects an insufficient debit without changing the balance or writing a debit entry", async () => {
    const { ownerId } = await createDoctorWallet("insufficient", 40);

    await expect(debitWallet({
      ownerType: "DOCTOR",
      ownerId,
      amount: 50,
      category: "WITHDRAWAL_PAYOUT",
      referenceId: uniqueId("insufficient-debit"),
      description: "Rejected debit",
    })).rejects.toBeInstanceOf(InsufficientWalletFundsError);

    const wallet = await getWallet(ownerId);
    expect(wallet.balance).toBe(40);
    expect((await getTransactions(wallet.id)).filter((entry) => entry.type === "DEBIT"))
      .toHaveLength(0);
  });

  it("records escrow and release entries and transfers commission to the platform", async () => {
    const { ownerId } = await createDoctorWallet("escrow-release");
    const bookingId = uniqueId("booking");
    testReferenceIds.add(bookingId);

    const escrowed = await escrowFunds({
      ownerType: "DOCTOR",
      ownerId,
      amount: 200,
      bookingId,
    });
    expect(escrowed).toMatchObject({ balance: 0, pendingFunds: 200 });

    const released = await releaseEscrow({
      ownerType: "DOCTOR",
      ownerId,
      amount: 200,
      bookingId,
      commissionRate: 0.1,
    });
    expect(released).toMatchObject({ balance: 180, pendingFunds: 0 });

    const wallet = await getWallet(ownerId);
    const entries = await getTransactions(wallet.id);
    expect(entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "CREDIT",
        category: "BOOKING_PAYMENT",
        amount: 200,
        balancePost: 0,
        pendingFundsPost: 200,
        referenceId: bookingId,
      }),
      expect.objectContaining({
        type: "CREDIT",
        category: "BOOKING_PAYMENT",
        amount: 200,
        balancePost: 200,
        referenceId: bookingId,
      }),
      expect.objectContaining({
        type: "DEBIT",
        category: "FEE_DEDUCTION",
        amount: 20,
        balancePost: 180,
        referenceId: bookingId,
      }),
    ]));

    const [platform] = await db
      .select({ id: walletsTable.id })
      .from(walletsTable)
      .where(and(
        eq(walletsTable.ownerType, "PLATFORM"),
        eq(walletsTable.ownerId, PLATFORM_OWNER_ID),
      ))
      .limit(1);
    const [platformEntry] = await db
      .select()
      .from(walletTransactionsTable)
      .where(and(
        eq(walletTransactionsTable.walletId, platform.id),
        eq(walletTransactionsTable.referenceId, bookingId),
      ));
    expect(platformEntry).toMatchObject({
      type: "CREDIT",
      category: "PLATFORM_COMMISSION",
      amount: 20,
      referenceId: bookingId,
    });
  });

  it("rolls back owner, platform, and ledger changes when a multi-wallet operation fails", async () => {
    const { ownerId } = await createDoctorWallet("rollback");
    const bookingId = uniqueId("rollback-booking");
    testReferenceIds.add(bookingId);
    await escrowFunds({
      ownerType: "DOCTOR",
      ownerId,
      amount: 150,
      bookingId,
    });

    await expect(db.transaction(async (tx) => {
      await releaseBookingEscrowInTx(tx, {
        ownerType: "DOCTOR",
        ownerId,
        amount: 150,
        bookingId,
        commissionRate: 0.2,
      });
      throw new Error("forced failure after all wallet writes");
    })).rejects.toThrow("forced failure");

    const wallet = await getWallet(ownerId);
    expect(wallet).toMatchObject({ balance: 0, pendingFunds: 150 });
    const ownerEntries = await getTransactions(wallet.id);
    expect(ownerEntries).toHaveLength(1);
    expect(ownerEntries[0]).toMatchObject({
      type: "CREDIT",
      category: "BOOKING_PAYMENT",
      pendingFundsPost: 150,
    });

    const [platform] = await db
      .select({ id: walletsTable.id })
      .from(walletsTable)
      .where(and(
        eq(walletsTable.ownerType, "PLATFORM"),
        eq(walletsTable.ownerId, PLATFORM_OWNER_ID),
      ))
      .limit(1);
    const platformEntries = await db
      .select()
      .from(walletTransactionsTable)
      .where(and(
        eq(walletTransactionsTable.walletId, platform.id),
        eq(walletTransactionsTable.referenceId, bookingId),
      ));
    expect(platformEntries).toHaveLength(0);
  });
});