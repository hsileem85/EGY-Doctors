import { pgTable, serial, integer, text, doublePrecision, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id"),
  doctorId: integer("doctor_id"),
  medicalCenterId: integer("medical_center_id"),
  escrowOwnerType: text("escrow_owner_type"),
  escrowOwnerId: text("escrow_owner_id"),
  paymobOrderId: text("paymob_order_id"),
  paymobTransactionId: text("paymob_transaction_id"),
  planType: text("plan_type").notNull(),
  amount: doublePrecision("amount").notNull(),
  cashbackAmount: doublePrecision("cashback_amount").notNull().default(0),
  currency: text("currency").notNull().default("EGP"),
  voucherCode: text("voucher_code"),
  status: text("status", { enum: ["PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUND_REQUESTED", "REFUNDED", "SETTLED"] }).notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  escrowedAt: timestamp("escrowed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("payments_appointment_unique")
    .on(table.appointmentId)
    .where(sql`${table.appointmentId} is not null`),
]);

export type Payment = typeof paymentsTable.$inferSelect;
