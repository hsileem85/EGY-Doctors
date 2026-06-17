import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const userRoleEnum = ["admin", "patient", "doctor", "medical_center"] as const;

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  nationalId: varchar("national_id", { length: 50 }),
  syndicateNumber: varchar("syndicate_number", { length: 100 }),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: userRoleEnum }).notNull().default("patient"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = typeof insertUserSchema.type;
export type User = typeof usersTable.$inferSelect;
