import crypto from "node:crypto";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import {
  db,
  pool,
  paymentsTable,
  walletsTable,
  walletTransactionsTable,
  systemSettingsTable,
  type WalletTransaction,
} from "@workspace/db";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  InsufficientWalletFundsError,
  creditWallet,
  debitWallet,
  ensureWallet,
  escrowBookingInTx,
  escrowFunds,
  releaseBookingEscrowInTx,
  releaseEscrow,
  releaseReservedCashbackInTx,
  calculateFinancialSplit,
} from "./wallet.service.js";

const PLATFORM_OWNER_ID = "SYSTEM_REVENUE";
const testOwnerIds = new Set<string>();
const testReferenceIds = new Set<string>();
const testPaymentIds = new Set<number>();

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
  it("keeps the patient share inside the gross booking split", () => {
    expect(calculateFinancialSplit(500, {
      deductionType: "FIXED", deductionValue: 50,
      platformSharePercentage: 50, cashbackSharePercentage: 50,
    })).toEqual({ deduction: 50, platformShare: 25, cashbackShare: 25 });
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

async function getPatientWallet(ownerId: string) {
  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.ownerType, "PATIENT"), eq(walletsTable.ownerId, ownerId)))
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

  const paymentIds = [...testPaymentIds];
  if (paymentIds.length > 0) {
    await db.delete(paymentsTable).where(inArray(paymentsTable.id, paymentIds));
  }

  const ownerIds = [...testOwnerIds];
  if (ownerIds.length > 0) {
    await db.delete(walletsTable).where(inArray(walletsTable.ownerId, ownerIds));
  }
  testOwnerIds.clear();
  testReferenceIds.clear();
  testPaymentIds.clear();
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
    expect(released).toMatchObject({ balance: 150, pendingFunds: 0 });

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
        amount: 50,
        balancePost: 150,
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
      amount: 25,
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

  it("releases a reserved booking cashback exactly once", async () => {
    const patientId = uniqueId("reserved-cashback");
    testOwnerIds.add(patientId);
    const bookingId = uniqueId("reserved-booking");
    testReferenceIds.add(bookingId);
    const patient = await ensureWallet("PATIENT", patientId);

    await db.transaction(async (tx) => {
      const [reserved] = await tx.update(walletsTable).set({
        reservedCashback: 25,
      }).where(eq(walletsTable.id, patient.id)).returning();
      await tx.insert(walletTransactionsTable).values({
        walletId: reserved.id,
        type: "CREDIT",
        category: "CASHBACK_RESERVE",
        amount: 25,
        balancePost: reserved.balance,
        reservedCashbackPost: 25,
        referenceId: `booking:${bookingId}`,
        description: "Test booking cashback reserve",
      });
    });

    const released = await db.transaction((tx) => releaseReservedCashbackInTx(tx, {
      patientUserId: patientId,
      bookingId,
    }));
    expect(released).toEqual({ amount: 25, alreadyReleased: false });

    const walletAfterRelease = await getPatientWallet(patientId);
    expect(walletAfterRelease).toMatchObject({ balance: 25, reservedCashback: 0 });
    const releasedAgain = await db.transaction((tx) => releaseReservedCashbackInTx(tx, {
      patientUserId: patientId,
      bookingId,
    }));
    expect(releasedAgain).toEqual({ amount: 0, alreadyReleased: true });
    const walletAfterReplay = await getPatientWallet(patientId);
    expect(walletAfterReplay).toMatchObject({ balance: 25, reservedCashback: 0 });
  });

  it("uses schema defaults when settings are absent and releases the same 25 EGP after review", async () => {
    const { ownerId } = await createDoctorWallet("default-split");
    const patientId = uniqueId("default-split-patient");
    testOwnerIds.add(patientId);
    const bookingId = uniqueId("default-split-booking");
    testReferenceIds.add(bookingId);
    const patient = await ensureWallet("PATIENT", patientId);
    const [existingSettings] = await db.select().from(systemSettingsTable)
      .where(eq(systemSettingsTable.id, 1)).limit(1);

    try {
      await db.transaction(async (tx) => {
        await tx.delete(systemSettingsTable).where(eq(systemSettingsTable.id, 1));
        await escrowBookingInTx(tx, {
          ownerType: "DOCTOR",
          ownerId,
          amount: 500,
          bookingId,
        });
        await releaseBookingEscrowInTx(tx, {
          ownerType: "DOCTOR",
          ownerId,
          amount: 500,
          bookingId,
          commissionRate: 0.1,
          patientUserId: patientId,
        });
      });

      const doctor = await getWallet(ownerId);
      expect(doctor).toMatchObject({ balance: 450, pendingFunds: 0 });
      const reservedPatient = await getPatientWallet(patientId);
      expect(reservedPatient).toMatchObject({ balance: 0, reservedCashback: 25 });

      const reviewResult = await db.transaction((tx) => releaseReservedCashbackInTx(tx, {
        patientUserId: patientId,
        bookingId,
      }));
      expect(reviewResult).toEqual({ amount: 25, alreadyReleased: false });
      const reviewedPatient = await getPatientWallet(patientId);
      expect(reviewedPatient).toMatchObject({ balance: 25, reservedCashback: 0 });
    } finally {
      if (existingSettings) {
        await db.insert(systemSettingsTable).values(existingSettings).onConflictDoUpdate({
          target: systemSettingsTable.id,
          set: {
            deductionType: existingSettings.deductionType,
            deductionValue: existingSettings.deductionValue,
            platformSharePercentage: existingSettings.platformSharePercentage,
            cashbackSharePercentage: existingSettings.cashbackSharePercentage,
            minDoctorWalletBalance: existingSettings.minDoctorWalletBalance,
            subscriptionModelEnabled: existingSettings.subscriptionModelEnabled,
            reviewPromptDelayHours: existingSettings.reviewPromptDelayHours,
            reviewCashbackAmount: existingSettings.reviewCashbackAmount,
          },
        });
      } else {
        await db.delete(systemSettingsTable).where(eq(systemSettingsTable.id, 1));
      }
    }
  });

  it("accepts the route completion transition to SETTLED before releasing escrow", async () => {
    const { ownerId } = await createDoctorWallet("settled-transition");
    const patientId = uniqueId("settled-transition-patient");
    testOwnerIds.add(patientId);
    const bookingId = uniqueId("settled-transition-booking");
    testReferenceIds.add(bookingId);
    await ensureWallet("PATIENT", patientId);

    const [payment] = await db.insert(paymentsTable).values({
      appointmentId: Number.parseInt(crypto.randomUUID().replace(/-/g, "").slice(0, 8), 16),
      escrowOwnerType: "DOCTOR",
      escrowOwnerId: ownerId,
      planType: "BOOKING",
      amount: 500,
      status: "PAID",
    }).returning();
    testPaymentIds.add(payment.id);

    await db.transaction(async (tx) => {
      await escrowBookingInTx(tx, {
        ownerType: "DOCTOR",
        ownerId,
        amount: 500,
        bookingId,
      });
      const [settled] = await tx.update(paymentsTable)
        .set({ status: "SETTLED" })
        .where(and(eq(paymentsTable.id, payment.id), eq(paymentsTable.status, "PAID")))
        .returning();
      expect(settled).toMatchObject({ id: payment.id, status: "SETTLED" });
      await releaseBookingEscrowInTx(tx, {
        ownerType: "DOCTOR",
        ownerId,
        amount: 500,
        bookingId,
        commissionRate: 0.1,
        patientUserId: patientId,
      });
    });

    expect(await getWallet(ownerId)).toMatchObject({ balance: 450, pendingFunds: 0 });
    expect(await getPatientWallet(patientId)).toMatchObject({ balance: 0, reservedCashback: 25 });
  });

  it("does not add a review reward to a legacy booking cashback credit", async () => {
    const patientId = uniqueId("legacy-cashback");
    testOwnerIds.add(patientId);
    const bookingId = uniqueId("legacy-booking");
    testReferenceIds.add(bookingId);
    const patient = await ensureWallet("PATIENT", patientId);

    await db.transaction(async (tx) => {
      const [credited] = await tx.update(walletsTable).set({
        balance: 25,
      }).where(eq(walletsTable.id, patient.id)).returning();
      await tx.insert(walletTransactionsTable).values({
        walletId: credited.id,
        type: "CREDIT",
        category: "CASHBACK_REWARD",
        amount: 25,
        balancePost: 25,
        referenceId: bookingId,
        description: "Legacy booking cashback",
      });
    });

    const result = await db.transaction((tx) => releaseReservedCashbackInTx(tx, {
      patientUserId: patientId,
      bookingId,
    }));
    expect(result).toEqual({ amount: 0, alreadyReleased: true });
    await expect(getPatientWallet(patientId)).resolves.toMatchObject({ balance: 25, reservedCashback: 0 });
  });
});