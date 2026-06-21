import { pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const userRoleEnum = ["admin", "patient", "doctor", "medical_center", "assistant"] as const;
export const langEnum = ["en", "ar"] as const;

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
  isActive: boolean("is_active").notNull().default(true),
  assistantClinicId: integer("assistant_clinic_id"),
  assistantDoctorId: integer("assistant_doctor_id"),
  // ── Preferences ──
  siteLanguage: text("site_language", { enum: langEnum }).notNull().default("en"),
  notificationLanguage: text("notification_language", { enum: langEnum }).notNull().default("ar"),
  notifyViaEmail: boolean("notify_via_email").notNull().default(true),
  notifyViaSms: boolean("notify_via_sms").notNull().default(false),
  notifyViaWhatsApp: boolean("notify_via_whatsapp").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = typeof insertUserSchema.type;
export type User = typeof usersTable.$inferSelect;
