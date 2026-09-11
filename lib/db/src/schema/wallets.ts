import {
  numeric,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const walletOwnerTypeEnum = [
  "PATIENT",
  "DOCTOR",
  "HOSPITAL",
  "MEDICAL_CENTER",
  "POLY_CLINIC",
  "LAB",
  "SCAN_CENTER",
  "VETERINARY",
  "PLATFORM",
] as const;

export const transactionTypeEnum = ["CREDIT", "DEBIT"] as const;

export const transactionCategoryEnum = [
  "BOOKING_PAYMENT",
  "PLATFORM_COMMISSION",
  "SUBSCRIPTION_FEE",
  "WITHDRAWAL_PAYOUT",
  "REFUND",
  "CASHBACK_REWARD",
  "WALLET_TOP_UP",
  "CASHBACK_USAGE",
  "FEE_DEDUCTION",
  "ADMIN_GIFT",
] as const;

export const walletsTable = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerType: text("owner_type", { enum: walletOwnerTypeEnum }).notNull(),
    ownerId: text("owner_id").notNull(),
    balance: numeric("balance", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
    pendingFunds: numeric("pending_funds", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
    currency: text("currency").notNull().default("EGP"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("wallets_owner_type_owner_id_unique").on(table.ownerType, table.ownerId),
  ],
);

export const walletTransactionsTable = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    walletId: uuid("wallet_id").notNull().references(() => walletsTable.id, { onDelete: "cascade" }),
    type: text("type", { enum: transactionTypeEnum }).notNull(),
    category: text("category", { enum: transactionCategoryEnum }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
    balancePost: numeric("balance_post", { precision: 14, scale: 2, mode: "number" }).notNull(),
    pendingFundsPost: numeric("pending_funds_post", { precision: 14, scale: 2, mode: "number" }),
    referenceId: text("reference_id"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("wallet_transactions_wallet_created_idx").on(table.walletId, table.createdAt),
    uniqueIndex("wallet_transactions_review_cashback_reference_unique")
      .on(table.walletId, table.referenceId)
      .where(sql`${table.category} = 'CASHBACK_REWARD' AND ${table.referenceId} LIKE 'review:%'`),
    uniqueIndex("wallet_transactions_doctor_approval_gift_unique")
      .on(table.walletId, table.referenceId)
      .where(sql`${table.category} = 'ADMIN_GIFT' AND ${table.referenceId} LIKE 'doctor-approval-gift:%'`),
    uniqueIndex("wallet_transactions_withdrawal_payout_unique")
      .on(table.walletId, table.referenceId)
      .where(sql`${table.category} = 'WITHDRAWAL_PAYOUT'`),
  ],
);

export const insertWalletSchema = createInsertSchema(walletsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactionsTable).omit({
  id: true,
  createdAt: true,
});

export type WalletOwnerType = (typeof walletOwnerTypeEnum)[number];
export type WalletTransactionType = (typeof transactionTypeEnum)[number];
export type WalletTransactionCategory = (typeof transactionCategoryEnum)[number];
export type Wallet = typeof walletsTable.$inferSelect;
export type WalletTransaction = typeof walletTransactionsTable.$inferSelect;