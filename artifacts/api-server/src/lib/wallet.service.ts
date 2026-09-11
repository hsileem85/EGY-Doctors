import {
  db,
  medicalCentersTable,
  usersTable,
  walletsTable,
  walletTransactionsTable,
  type WalletOwnerType,
  type WalletTransactionCategory,
} from "@workspace/db";
import { and, desc, eq, gte, sql } from "drizzle-orm";

const PLATFORM_OWNER_ID = "SYSTEM_REVENUE";

export class WalletNotFoundError extends Error {
  constructor() {
    super("Wallet not found");
  }
}

export class InsufficientWalletFundsError extends Error {
  constructor(message = "Insufficient wallet funds") {
    super(message);
  }
}

function normalizeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new RangeError("Amount must be a positive finite number");
  }
  return Math.round(amount * 100) / 100;
}

function normalizeCommissionRate(rate: number): number {
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new RangeError("Commission rate must be between 0 and 1");
  }
  return rate;
}

export function centerSubtypeToWalletOwnerType(
  subType: string | null | undefined,
): WalletOwnerType {
  switch (subType) {
    case "HOSPITAL":
      return "HOSPITAL";
    case "POLY_CLINIC":
      return "POLY_CLINIC";
    case "LAB":
      return "LAB";
    case "SCAN_CENTER":
      return "SCAN_CENTER";
    case "VETERINARY_CLINIC":
      return "VETERINARY";
    default:
      return "MEDICAL_CENTER";
  }
}

export async function resolveWalletOwner(
  userId: number,
  role: string,
): Promise<{ ownerType: WalletOwnerType; ownerId: string } | null> {
  if (role === "patient") return { ownerType: "PATIENT", ownerId: String(userId) };
  if (role === "doctor") return { ownerType: "DOCTOR", ownerId: String(userId) };
  if (role === "admin") return { ownerType: "PLATFORM", ownerId: PLATFORM_OWNER_ID };
  if (role !== "medical_center") return null;

  const [center] = await db
    .select({ subType: medicalCentersTable.subType })
    .from(medicalCentersTable)
    .where(eq(medicalCentersTable.userId, userId))
    .limit(1);

  return {
    ownerType: centerSubtypeToWalletOwnerType(center?.subType),
    ownerId: String(userId),
  };
}

export async function ensureWallet(
  ownerType: WalletOwnerType,
  ownerId: string,
) {
  await db
    .insert(walletsTable)
    .values({ ownerType, ownerId })
    .onConflictDoNothing({
      target: [walletsTable.ownerType, walletsTable.ownerId],
    });

  const [wallet] = await db
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.ownerType, ownerType), eq(walletsTable.ownerId, ownerId)))
    .limit(1);

  if (!wallet) throw new WalletNotFoundError();
  return wallet;
}

export async function syncMedicalCenterWalletType(
  userId: number,
  subType: string | null | undefined,
) {
  const ownerId = String(userId);
  const ownerType = centerSubtypeToWalletOwnerType(subType);

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: walletsTable.id })
      .from(walletsTable)
      .where(eq(walletsTable.ownerId, ownerId))
      .limit(1);

    if (existing) {
      await tx
        .update(walletsTable)
        .set({ ownerType, updatedAt: new Date() })
        .where(eq(walletsTable.id, existing.id));
    } else {
      await tx.insert(walletsTable).values({ ownerType, ownerId });
    }
  });
}

export async function initializeWallets(): Promise<void> {
  await ensureWallet("PLATFORM", PLATFORM_OWNER_ID);

  const users = await db
    .select({
      id: usersTable.id,
      role: usersTable.role,
      centerSubType: medicalCentersTable.subType,
    })
    .from(usersTable)
    .leftJoin(medicalCentersTable, eq(medicalCentersTable.userId, usersTable.id));

  for (const user of users) {
    if (user.role === "patient") {
      await ensureWallet("PATIENT", String(user.id));
    } else if (user.role === "doctor") {
      await ensureWallet("DOCTOR", String(user.id));
    } else if (user.role === "medical_center") {
      await syncMedicalCenterWalletType(user.id, user.centerSubType);
    }
  }
}

interface WalletMutationInput {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  category: WalletTransactionCategory;
  referenceId?: string | null;
  description: string;
}

export async function creditWallet(input: WalletMutationInput) {
  const amount = normalizeAmount(input.amount);

  return db.transaction(async (tx) => {
    const [wallet] = await tx
      .update(walletsTable)
      .set({
        balance: sql`${walletsTable.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(walletsTable.ownerType, input.ownerType),
        eq(walletsTable.ownerId, input.ownerId),
      ))
      .returning();

    if (!wallet) throw new WalletNotFoundError();

    const [transaction] = await tx
      .insert(walletTransactionsTable)
      .values({
        walletId: wallet.id,
        type: "CREDIT",
        category: input.category,
        amount,
        balancePost: wallet.balance,
        referenceId: input.referenceId ?? null,
        description: input.description,
      })
      .returning();

    return { wallet, transaction };
  });
}

export async function debitWallet(input: WalletMutationInput) {
  const amount = normalizeAmount(input.amount);

  return db.transaction(async (tx) => {
    const [wallet] = await tx
      .update(walletsTable)
      .set({
        balance: sql`${walletsTable.balance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(walletsTable.ownerType, input.ownerType),
        eq(walletsTable.ownerId, input.ownerId),
        gte(walletsTable.balance, amount),
      ))
      .returning();

    if (!wallet) {
      const [exists] = await tx
        .select({ id: walletsTable.id })
        .from(walletsTable)
        .where(and(
          eq(walletsTable.ownerType, input.ownerType),
          eq(walletsTable.ownerId, input.ownerId),
        ))
        .limit(1);
      if (!exists) throw new WalletNotFoundError();
      throw new InsufficientWalletFundsError();
    }

    const [transaction] = await tx
      .insert(walletTransactionsTable)
      .values({
        walletId: wallet.id,
        type: "DEBIT",
        category: input.category,
        amount,
        balancePost: wallet.balance,
        referenceId: input.referenceId ?? null,
        description: input.description,
      })
      .returning();

    return { wallet, transaction };
  });
}

export async function escrowFunds(input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
}) {
  const amount = normalizeAmount(input.amount);

  return db.transaction(async (tx) => {
    const [wallet] = await tx
      .update(walletsTable)
      .set({
        pendingFunds: sql`${walletsTable.pendingFunds} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(walletsTable.ownerType, input.ownerType),
        eq(walletsTable.ownerId, input.ownerId),
      ))
      .returning();

    if (!wallet) throw new WalletNotFoundError();
    return wallet;
  });
}

export async function releaseEscrow(input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
  commissionRate: number;
}) {
  const amount = normalizeAmount(input.amount);
  const commissionRate = normalizeCommissionRate(input.commissionRate);
  const commission = Math.round(amount * commissionRate * 100) / 100;

  return db.transaction(async (tx) => {
    const [creditedOwner] = await tx
      .update(walletsTable)
      .set({
        pendingFunds: sql`${walletsTable.pendingFunds} - ${amount}`,
        balance: sql`${walletsTable.balance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(walletsTable.ownerType, input.ownerType),
        eq(walletsTable.ownerId, input.ownerId),
        gte(walletsTable.pendingFunds, amount),
      ))
      .returning();

    if (!creditedOwner) {
      throw new InsufficientWalletFundsError("Insufficient pending funds");
    }

    await tx.insert(walletTransactionsTable).values({
      walletId: creditedOwner.id,
      type: "CREDIT",
      category: "BOOKING_PAYMENT",
      amount,
      balancePost: creditedOwner.balance,
      referenceId: input.bookingId,
      description: "Booking escrow released",
    });

    let ownerWallet = creditedOwner;

    if (commission > 0) {
      const [debitedOwner] = await tx
        .update(walletsTable)
        .set({
          balance: sql`${walletsTable.balance} - ${commission}`,
          updatedAt: new Date(),
        })
        .where(eq(walletsTable.id, creditedOwner.id))
        .returning();

      if (!debitedOwner) throw new WalletNotFoundError();
      ownerWallet = debitedOwner;

      await tx.insert(walletTransactionsTable).values({
        walletId: debitedOwner.id,
        type: "DEBIT",
        category: "PLATFORM_COMMISSION",
        amount: commission,
        balancePost: debitedOwner.balance,
        referenceId: input.bookingId,
        description: "Platform commission",
      });

      await tx
        .insert(walletsTable)
        .values({ ownerType: "PLATFORM", ownerId: PLATFORM_OWNER_ID })
        .onConflictDoNothing({
          target: [walletsTable.ownerType, walletsTable.ownerId],
        });

      const [platformWallet] = await tx
        .update(walletsTable)
        .set({
          balance: sql`${walletsTable.balance} + ${commission}`,
          updatedAt: new Date(),
        })
        .where(and(
          eq(walletsTable.ownerType, "PLATFORM"),
          eq(walletsTable.ownerId, PLATFORM_OWNER_ID),
        ))
        .returning();

      if (!platformWallet) throw new WalletNotFoundError();

      await tx.insert(walletTransactionsTable).values({
        walletId: platformWallet.id,
        type: "CREDIT",
        category: "PLATFORM_COMMISSION",
        amount: commission,
        balancePost: platformWallet.balance,
        referenceId: input.bookingId,
        description: "Platform commission received",
      });
    }

    return ownerWallet;
  });
}

export async function getWalletWithTransactions(
  ownerType: WalletOwnerType,
  ownerId: string,
) {
  const wallet = await ensureWallet(ownerType, ownerId);
  const transactions = await db
    .select()
    .from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.walletId, wallet.id))
    .orderBy(desc(walletTransactionsTable.createdAt));

  return { ...wallet, transactions };
}