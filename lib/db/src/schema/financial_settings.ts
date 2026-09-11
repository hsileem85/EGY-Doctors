import { boolean, integer, numeric, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const deductionTypeEnum = ["FIXED", "PERCENTAGE"] as const;

/** The single configurable row for platform-wide financial rules. */
export const systemSettingsTable = pgTable("system_settings", {
  id: integer("id").primaryKey().default(1),
  deductionType: text("deduction_type", { enum: deductionTypeEnum }).notNull().default("FIXED"),
  deductionValue: numeric("deduction_value", { precision: 14, scale: 2, mode: "number" }).notNull().default(50),
  platformSharePercentage: numeric("platform_share_percentage", { precision: 5, scale: 2, mode: "number" }).notNull().default(50),
  cashbackSharePercentage: numeric("cashback_share_percentage", { precision: 5, scale: 2, mode: "number" }).notNull().default(50),
  minDoctorWalletBalance: numeric("min_doctor_wallet_balance", { precision: 14, scale: 2, mode: "number" }).notNull().default(50),
  subscriptionModelEnabled: boolean("subscription_model_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettingsTable).omit({ id: true, updatedAt: true });
export type SystemSettings = typeof systemSettingsTable.$inferSelect;
export type InsertSystemSettings = typeof insertSystemSettingsSchema.type;

export const bankAccountsTable = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerType: text("owner_type").notNull(),
  ownerId: text("owner_id").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number"),
  iban: text("iban"),
  branchName: text("branch_name"),
  swiftCode: text("swift_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("bank_accounts_owner_unique").on(table.ownerType, table.ownerId),
]);

export const insertBankAccountSchema = createInsertSchema(bankAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type BankAccount = typeof bankAccountsTable.$inferSelect;
export type InsertBankAccount = typeof insertBankAccountSchema.type;

export const withdrawalStatusEnum = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"] as const;

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorUserId: text("doctor_user_id").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2, mode: "number" }).notNull(),
  bankAccountId: uuid("bank_account_id").notNull().references(() => bankAccountsTable.id),
  status: text("status", { enum: withdrawalStatusEnum }).notNull().default("PENDING"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequestsTable).omit({
  id: true, status: true, createdAt: true, updatedAt: true, completedAt: true,
});
export type WithdrawalRequest = typeof withdrawalRequestsTable.$inferSelect;
export type InsertWithdrawalRequest = typeof insertWithdrawalRequestSchema.type;