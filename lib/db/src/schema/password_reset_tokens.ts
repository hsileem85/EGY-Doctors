import { pgTable, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokensTable).omit({ id: true, createdAt: true });
export type InsertPasswordResetToken = typeof insertPasswordResetTokenSchema._type;
export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
