import { pgTable, serial, integer, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id"),
  medicalCenterId: integer("medical_center_id"),
  paymobOrderId: text("paymob_order_id"),
  paymobTransactionId: text("paymob_transaction_id"),
  planType: text("plan_type").notNull(),
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").notNull().default("EGP"),
  voucherCode: text("voucher_code"),
  status: text("status", { enum: ["PENDING", "PAID", "FAILED"] }).notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export type Payment = typeof paymentsTable.$inferSelect;
