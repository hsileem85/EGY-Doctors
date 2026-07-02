import { pgTable, serial, text, varchar, integer, timestamp, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const doctorStatusEnum = ["incomplete", "pending", "approved", "rejected"] as const;
export const doctorOnboardingEnum = ["pending", "approved", "rejected"] as const;
export const subscriptionStatusEnum = ["ACTIVE", "INACTIVE", "TRIAL"] as const;

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  specialtyId: integer("specialty_id"),
  cityId: integer("city_id"),
  areaId: integer("area_id"),
  clinicAddress: text("clinic_address"),
  bioEn: text("bio_en"),
  bio: text("bio"),
  image: text("image"),
  fee: integer("fee"),
  experience: integer("experience"),
  license: varchar("license", { length: 100 }),
  rating: doublePrecision("rating").default(0),
  reviews: integer("reviews").default(0),
  accountStatus: text("account_status", { enum: doctorStatusEnum }).notNull().default("incomplete"),
  onboardingStatus: text("onboarding_status", { enum: doctorOnboardingEnum }).notNull().default("pending"),
  websiteUrl: text("website_url"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  xUrl: text("x_url"),
  isActive: boolean("is_active").notNull().default(true),
  hasVezeetaProfile: boolean("has_vezeeta_profile").notNull().default(false),
  affiliatedCenterId: integer("affiliated_center_id"),
  schedule: text("schedule"),
  subscriptionStatus: text("subscription_status", { enum: subscriptionStatusEnum }).notNull().default("INACTIVE"),
  subscriptionPlan: text("subscription_plan").notNull().default("SEMI_ANNUAL"),
  subscriptionEndDate: timestamp("subscription_end_date", { withTimezone: true }),
  isTrialUsed: boolean("is_trial_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDoctor = typeof insertDoctorSchema.type;
export type Doctor = typeof doctorsTable.$inferSelect;
