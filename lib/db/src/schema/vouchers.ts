import { pgTable, serial, text, doublePrecision, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const vouchersTable = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  discountPercentage: doublePrecision("discount_percentage").notNull().default(0),
  additionalFreeDays: integer("additional_free_days").notNull().default(0),
  expirationDate: timestamp("expiration_date", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Voucher = typeof vouchersTable.$inferSelect;
