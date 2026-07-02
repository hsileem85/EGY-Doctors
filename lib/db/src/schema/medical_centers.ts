import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { subscriptionStatusEnum } from "./doctors";

export const medicalCentersTable = pgTable("medical_centers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  name: text("name").notNull().default("Medical Center"),
  nameAr: text("name_ar"),
  type: text("type").notNull().default("clinic"),
  phone: text("phone"),
  address: text("address"),
  cityId: integer("city_id"),
  commercialRegistrationNumber: text("commercial_registration_number"),
  image: text("image"),
  bio: text("bio"),
  bioAr: text("bio_ar"),
  isActive: boolean("is_active").notNull().default(true),
  subscriptionStatus: text("subscription_status", { enum: subscriptionStatusEnum }).notNull().default("INACTIVE"),
  subscriptionPlan: text("subscription_plan").notNull().default("SEMI_ANNUAL"),
  subscriptionEndDate: timestamp("subscription_end_date", { withTimezone: true }),
  isTrialUsed: boolean("is_trial_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type MedicalCenter = typeof medicalCentersTable.$inferSelect;
