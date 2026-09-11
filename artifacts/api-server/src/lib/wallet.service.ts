import {
  db,
  medicalCentersTable,
  usersTable,
  walletsTable,
  walletTransactionsTable,
  systemSettingsTable,
  doctorsTable,
  notificationsTable,
  type WalletOwnerType,
  type WalletTransactionCategory,
} from "@workspace/db";
import { and, desc, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";

const PLATFORM_OWNER_ID = "SYSTEM_REVENUE";
type WalletTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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

export async function getFinancialSettingsInTx(tx: WalletTx) {
  const [row] = await tx.select().from(systemSettingsTable).where(eq(systemSettingsTable.id, 1)).limit(1);
  return row;
}

export function calculateFinancialSplit(amount: number, settings: {
  deductionType: "FIXED" | "PERCENTAGE";
  deductionValue: number;
  platformSharePercentage: number;
  cashbackSharePercentage: number;
}) {
  const deduction = settings.deductionType === "FIXED"
    ? Math.min(amount, Math.max(0, settings.deductionValue))
    : amount * Math.max(0, Math.min(100, settings.deductionValue)) / 100;
  return {
    deduction: Math.round(deduction * 100) / 100,
    platformShare: Math.round(deduction * settings.platformSharePercentage / 100 * 100) / 100,
    cashbackShare: Math.round(deduction * settings.cashbackSharePercentage / 100 * 100) / 100,
  };
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
      const [doctor] = await db.select({ accountStatus: doctorsTable.accountStatus })
        .from(doctorsTable).where(eq(doctorsTable.userId, user.id)).limit(1);
      if (doctor?.accountStatus === "approved") {
        await grantDoctorApprovalGift(user.id);
      }
    } else if (user.role === "medical_center") {
      await syncMedicalCenterWalletType(user.id, user.centerSubType);
    }
  }
}

export async function grantDoctorApprovalGiftInTx(tx: WalletTx, userId: number): Promise<boolean> {
  const ownerId = String(userId);
  const wallet = await ensureWalletInTx(tx, "DOCTOR", ownerId);
  const [lockedWallet] = await tx.select().from(walletsTable)
    .where(eq(walletsTable.id, wallet.id))
    .limit(1)
    .for("update");
  if (!lockedWallet) throw new WalletNotFoundError();
  const giftAmount = 50;
  const referenceId = `doctor-approval-gift:${userId}`;
  const [gift] = await tx.insert(walletTransactionsTable).values({
    walletId: lockedWallet.id,
    type: "CREDIT",
    category: "ADMIN_GIFT",
    amount: giftAmount,
    balancePost: lockedWallet.balance + giftAmount,
    referenceId,
    description: "Doctor approval welcome gift",
  }).onConflictDoNothing().returning({ id: walletTransactionsTable.id });
  if (!gift) return false;
  await tx.update(walletsTable).set({
    balance: sql`${walletsTable.balance} + ${giftAmount}`,
    updatedAt: new Date(),
  }).where(eq(walletsTable.id, lockedWallet.id));
  await tx.insert(notificationsTable).values({
    userId,
    type: "wallet_low_balance",
    title: "Welcome gift added to your wallet",
    body: "We added 50 EGP to your wallet. Keep your balance at or above 50 EGP so your profile remains visible to patients.",
    data: { balance: lockedWallet.balance + giftAmount, threshold: 50 },
  });
  return true;
}

export async function grantDoctorApprovalGift(userId: number): Promise<boolean> {
  return db.transaction((tx) => grantDoctorApprovalGiftInTx(tx, userId));
}

export async function notifyDoctorLowBalanceCrossingInTx(
  tx: WalletTx,
  ownerId: string,
  balanceBefore: number,
  balanceAfter: number,
): Promise<void> {
  const financial = await getFinancialSettingsInTx(tx);
  const threshold = financial?.minDoctorWalletBalance ?? 50;
  if (balanceBefore <= threshold || balanceAfter > threshold) return;
  const userId = Number(ownerId);
  if (!Number.isInteger(userId)) return;
  await tx.insert(notificationsTable).values({
    userId,
    type: "wallet_low_balance",
    title: "Wallet balance warning",
    body: `Your wallet balance is ${balanceAfter.toFixed(2)} EGP. Top up to keep your profile visible to patients.`,
    data: { balance: balanceAfter, threshold },
  });
}

interface WalletMutationInput {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  category: WalletTransactionCategory;
  referenceId?: string | null;
  description: string;
}

async function ensureWalletInTx(
  tx: WalletTx,
  ownerType: WalletOwnerType,
  ownerId: string,
) {
  await tx
    .insert(walletsTable)
    .values({ ownerType, ownerId })
    .onConflictDoNothing({
      target: [walletsTable.ownerType, walletsTable.ownerId],
    });

  const [wallet] = await tx
    .select()
    .from(walletsTable)
    .where(and(eq(walletsTable.ownerType, ownerType), eq(walletsTable.ownerId, ownerId)))
    .limit(1);

  if (!wallet) throw new WalletNotFoundError();
  return wallet;
}

export async function escrowBookingInTx(tx: WalletTx, input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
}) {
  const amount = normalizeAmount(input.amount);
  const ensuredWallet = await ensureWalletInTx(tx, input.ownerType, input.ownerId);
  const [lockedWallet] = await tx
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.id, ensuredWallet.id))
    .limit(1)
    .for("update");
  if (!lockedWallet) throw new WalletNotFoundError();

  // The verified payment status transition normally provides this guard. Keep
  // it here as well because a late webhook can race another escrow attempt.
  const [existingEscrow] = await tx
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.type, "CREDIT"),
      eq(walletTransactionsTable.category, "BOOKING_PAYMENT"),
      eq(walletTransactionsTable.referenceId, input.bookingId),
      isNotNull(walletTransactionsTable.pendingFundsPost),
    ))
    .limit(1);
  if (existingEscrow) return lockedWallet;

  const [wallet] = await tx
    .update(walletsTable)
    .set({
      pendingFunds: sql`${walletsTable.pendingFunds} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(walletsTable.id, lockedWallet.id))
    .returning();

  if (!wallet) throw new WalletNotFoundError();
  await tx.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "CREDIT",
    category: "BOOKING_PAYMENT",
    amount,
    balancePost: wallet.balance,
    pendingFundsPost: wallet.pendingFunds,
    referenceId: input.bookingId,
    description: "Booking payment placed in escrow",
  });
  return wallet;
}

export async function refundBookingEscrowInTx(tx: WalletTx, input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
}) {
  const amount = normalizeAmount(input.amount);
  const [wallet] = await tx
    .update(walletsTable)
    .set({
      pendingFunds: sql`${walletsTable.pendingFunds} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(walletsTable.ownerType, input.ownerType),
      eq(walletsTable.ownerId, input.ownerId),
      gte(walletsTable.pendingFunds, amount),
    ))
    .returning();

  if (!wallet) throw new InsufficientWalletFundsError("Insufficient pending funds");

  await tx.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "DEBIT",
    category: "REFUND",
    amount,
    balancePost: wallet.balance,
    pendingFundsPost: wallet.pendingFunds,
    referenceId: input.bookingId,
    description: "Booking payment refunded from escrow",
  });

  return wallet;
}

export async function releaseBookingEscrowInTx(tx: WalletTx, input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
  commissionRate: number;
  patientUserId?: string | null;
}) {
  const amount = normalizeAmount(input.amount);
  normalizeCommissionRate(input.commissionRate);
  const financial = await getFinancialSettingsInTx(tx);
  const split = financial
    ? calculateFinancialSplit(amount, financial)
    : calculateFinancialSplit(amount, {
      // Match the schema defaults when a pre-settings database has no row.
      // The legacy commission-rate fallback would silently drop the patient
      // share and settle a 500 EGP booking as doctor450/platform50.
      deductionType: "FIXED",
      deductionValue: 50,
      platformSharePercentage: 50,
      cashbackSharePercentage: 50,
    });

  const owner = await ensureWalletInTx(tx, input.ownerType, input.ownerId);
  const [lockedOwner] = await tx
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.id, owner.id))
    .limit(1)
    .for("update");
  if (!lockedOwner) throw new WalletNotFoundError();

  // A payment may be settled by the appointment request or by a late Paymob
  // webhook. Both paths are allowed to call this function, but only one may
  // create the settlement ledger entry.
  const [existingRelease] = await tx
    .select()
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedOwner.id),
      eq(walletTransactionsTable.type, "CREDIT"),
      eq(walletTransactionsTable.category, "BOOKING_PAYMENT"),
      eq(walletTransactionsTable.referenceId, input.bookingId),
      isNull(walletTransactionsTable.pendingFundsPost),
    ))
    .limit(1);
  if (existingRelease) {
    return lockedOwner;
  }

  if (lockedOwner.pendingFunds < amount) {
    throw new InsufficientWalletFundsError("Insufficient pending funds");
  }

  const [creditedOwner] = await tx
    .update(walletsTable)
    .set({
      pendingFunds: sql`${walletsTable.pendingFunds} - ${amount}`,
      balance: sql`${walletsTable.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(walletsTable.id, lockedOwner.id))
    .returning();

  if (!creditedOwner) throw new WalletNotFoundError();

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
  if (split.deduction > 0) {
    const [debitedOwner] = await tx
      .update(walletsTable)
      .set({
        balance: sql`${walletsTable.balance} - ${split.deduction}`,
        updatedAt: new Date(),
      })
      .where(eq(walletsTable.id, creditedOwner.id))
      .returning();
    if (!debitedOwner) throw new WalletNotFoundError();
    ownerWallet = debitedOwner;

    await tx.insert(walletTransactionsTable).values({
      walletId: debitedOwner.id,
      type: "DEBIT",
      amount: split.deduction,
      balancePost: debitedOwner.balance,
      referenceId: input.bookingId,
      category: "FEE_DEDUCTION",
      description: "Configured booking fee deduction",
    });
    if (input.ownerType === "DOCTOR") {
      await notifyDoctorLowBalanceCrossingInTx(
        tx,
        input.ownerId,
        creditedOwner.balance,
        debitedOwner.balance,
      );
    }

    const platformWallet = await ensureWalletInTx(tx, "PLATFORM", PLATFORM_OWNER_ID);
    const [creditedPlatform] = await tx
      .update(walletsTable)
      .set({
        balance: sql`${walletsTable.balance} + ${split.platformShare}`,
        updatedAt: new Date(),
      })
      .where(eq(walletsTable.id, platformWallet.id))
      .returning();
    if (!creditedPlatform) throw new WalletNotFoundError();

    await tx.insert(walletTransactionsTable).values({
      walletId: creditedPlatform.id,
      type: "CREDIT",
      category: "PLATFORM_COMMISSION",
      amount: split.platformShare,
      balancePost: creditedPlatform.balance,
      referenceId: input.bookingId,
      description: "Platform commission received",
    });
    if (split.cashbackShare > 0 && input.patientUserId) {
      await reserveBookingCashbackInTx(tx, {
        patientUserId: input.patientUserId,
        bookingId: input.bookingId,
        amount: split.cashbackShare,
      });
    }
  }

  return ownerWallet;
}

/**
 * Holds the booking's cashback share outside the patient's spendable balance.
 * The hold is released by the review transaction after the configured delay.
 * This keeps completion and review as one 25 EGP reward rather than two
 * independent credits.
 */
async function reserveBookingCashbackInTx(tx: WalletTx, input: {
  patientUserId: string;
  bookingId: string;
  amount: number;
}) {
  const amount = normalizeAmount(input.amount);
  const wallet = await ensureWalletInTx(tx, "PATIENT", input.patientUserId);
  const [lockedWallet] = await tx
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.id, wallet.id))
    .limit(1)
    .for("update");
  if (!lockedWallet) throw new WalletNotFoundError();

  // Deployments before reserved cashback was introduced credited this amount
  // immediately using the booking id. Never reserve or pay that legacy entry
  // again when its appointment is later reviewed.
  const [legacyReward] = await tx
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.type, "CREDIT"),
      eq(walletTransactionsTable.category, "CASHBACK_REWARD"),
      eq(walletTransactionsTable.referenceId, input.bookingId),
    ))
    .limit(1);
  if (legacyReward) return lockedWallet;

  const reserveReference = `booking:${input.bookingId}`;
  const [existingReserve] = await tx
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.category, "CASHBACK_RESERVE"),
      eq(walletTransactionsTable.referenceId, reserveReference),
    ))
    .limit(1);
  if (existingReserve) return lockedWallet;

  const [reservedWallet] = await tx
    .update(walletsTable)
    .set({
      reservedCashback: sql`${walletsTable.reservedCashback} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(walletsTable.id, lockedWallet.id))
    .returning();
  if (!reservedWallet) throw new WalletNotFoundError();

  await tx.insert(walletTransactionsTable).values({
    walletId: reservedWallet.id,
    type: "CREDIT",
    category: "CASHBACK_RESERVE",
    amount,
    balancePost: reservedWallet.balance,
    reservedCashbackPost: reservedWallet.reservedCashback,
    referenceId: reserveReference,
    description: "Booking cashback reserved until eligible review",
  });
  return reservedWallet;
}

export async function releaseReservedCashbackInTx(tx: WalletTx, input: {
  patientUserId: string;
  bookingId: string;
}) {
  const wallet = await ensureWalletInTx(tx, "PATIENT", input.patientUserId);
  const [lockedWallet] = await tx
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.id, wallet.id))
    .limit(1)
    .for("update");
  if (!lockedWallet) throw new WalletNotFoundError();

  const reviewReference = `review:${input.bookingId}`;
  const [existingReward] = await tx
    .select({ id: walletTransactionsTable.id, amount: walletTransactionsTable.amount })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.type, "CREDIT"),
      eq(walletTransactionsTable.category, "CASHBACK_REWARD"),
      eq(walletTransactionsTable.referenceId, reviewReference),
    ))
    .limit(1);
  if (existingReward) return { amount: 0, alreadyReleased: true };

  // A legacy completion credited using the bare appointment id. It is already
  // the full reward and must not receive a second review bonus.
  const [legacyReward] = await tx
    .select({ id: walletTransactionsTable.id })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.type, "CREDIT"),
      eq(walletTransactionsTable.category, "CASHBACK_REWARD"),
      eq(walletTransactionsTable.referenceId, input.bookingId),
    ))
    .limit(1);
  if (legacyReward) return { amount: 0, alreadyReleased: true };

  const [reserve] = await tx
    .select({ amount: walletTransactionsTable.amount })
    .from(walletTransactionsTable)
    .where(and(
      eq(walletTransactionsTable.walletId, lockedWallet.id),
      eq(walletTransactionsTable.category, "CASHBACK_RESERVE"),
      eq(walletTransactionsTable.referenceId, `booking:${input.bookingId}`),
    ))
    .limit(1);
  const amount = reserve?.amount ?? 0;
  if (amount <= 0) return { amount: 0, alreadyReleased: false };
  if (lockedWallet.reservedCashback < amount) {
    throw new InsufficientWalletFundsError("Insufficient reserved cashback");
  }

  const [releasedWallet] = await tx
    .update(walletsTable)
    .set({
      reservedCashback: sql`${walletsTable.reservedCashback} - ${amount}`,
      balance: sql`${walletsTable.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(walletsTable.id, lockedWallet.id))
    .returning();
  if (!releasedWallet) throw new WalletNotFoundError();

  await tx.insert(walletTransactionsTable).values({
    walletId: releasedWallet.id,
    type: "CREDIT",
    category: "CASHBACK_REWARD",
    amount,
    balancePost: releasedWallet.balance,
    reservedCashbackPost: releasedWallet.reservedCashback,
    referenceId: reviewReference,
    description: "Booking cashback released after eligible review",
  });
  return { amount, alreadyReleased: false };
}

export async function recordSubscriptionFeeInTx(tx: WalletTx, input: {
  amount: number;
  paymentId: string;
}) {
  const amount = normalizeAmount(input.amount);
  const platformWallet = await ensureWalletInTx(tx, "PLATFORM", PLATFORM_OWNER_ID);
  const [wallet] = await tx
    .update(walletsTable)
    .set({
      balance: sql`${walletsTable.balance} + ${amount}`,
      updatedAt: new Date(),
    })
    .where(eq(walletsTable.id, platformWallet.id))
    .returning();
  if (!wallet) throw new WalletNotFoundError();

  const [transaction] = await tx.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "CREDIT",
    category: "SUBSCRIPTION_FEE",
    amount,
    balancePost: wallet.balance,
    referenceId: input.paymentId,
    description: "Subscription fee received",
  }).returning();

  return { wallet, transaction };
}

export async function recordSubscriptionRefundInTx(tx: WalletTx, input: {
  amount: number;
  paymentId: string;
}) {
  const amount = normalizeAmount(input.amount);
  const platformWallet = await ensureWalletInTx(tx, "PLATFORM", PLATFORM_OWNER_ID);
  const [wallet] = await tx
    .update(walletsTable)
    .set({
      balance: sql`${walletsTable.balance} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(and(
      eq(walletsTable.id, platformWallet.id),
      gte(walletsTable.balance, amount),
    ))
    .returning();
  if (!wallet) throw new InsufficientWalletFundsError("Insufficient platform funds for refund");

  const [transaction] = await tx.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "DEBIT",
    category: "REFUND",
    amount,
    balancePost: wallet.balance,
    referenceId: input.paymentId,
    description: "Subscription payment refunded",
  }).returning();

  return { wallet, transaction };
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
    if (input.ownerType === "DOCTOR") {
      await notifyDoctorLowBalanceCrossingInTx(
        tx,
        input.ownerId,
        wallet.balance + amount,
        wallet.balance,
      );
    }

    return { wallet, transaction };
  });
}

export async function escrowFunds(input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
}) {
  return db.transaction((tx) => escrowBookingInTx(tx, input));
}

export async function releaseEscrow(input: {
  ownerType: WalletOwnerType;
  ownerId: string;
  amount: number;
  bookingId: string;
  commissionRate: number;
}) {
  return db.transaction((tx) => releaseBookingEscrowInTx(tx, input));
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