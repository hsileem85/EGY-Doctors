import { pgTable, serial, integer, text, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { subscriptionStatusEnum } from "./doctors";

export const centerSubTypeEnum = ["POLY_CLINIC", "HOSPITAL", "LAB", "SCAN_CENTER", "VETERINARY_CLINIC"] as const;

export const medicalCentersTable = pgTable("medical_centers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  name: text("name").notNull().default("Medical Center"),
  nameAr: text("name_ar"),
  type: text("type").notNull().default("clinic"),
  subType: text("sub_type", { enum: centerSubTypeEnum }),
  phone: text("phone"),
  address: text("address"),
  cityId: integer("city_id"),
  commercialRegistrationNumber: text("commercial_registration_number"),
  image: text("image"),
  bio: text("bio"),
  bioAr: text("bio_ar"),
  isActive: boolean("is_active").notNull().default(true),
  website: text("website"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  services: integer("services").array(),
  isApproved: boolean("is_approved").notNull().default(false),
  hasVezeetaProfile: boolean("has_vezeeta_profile").notNull().default(false),
  subscriptionStatus: text("subscription_status", { enum: subscriptionStatusEnum }).notNull().default("INACTIVE"),
  subscriptionPlan: text("subscription_plan").notNull().default("SEMI_ANNUAL"),
  subscriptionEndDate: timestamp("subscription_end_date", { withTimezone: true }),
  isTrialUsed: boolean("is_trial_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const centerClinicsTable = pgTable("center_clinics", {
  id: serial("id").primaryKey(),
  medicalCenterId: integer("medical_center_id").notNull().references(() => medicalCentersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  specialty: text("specialty"),
  doctorId: integer("doctor_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MedicalCenter = typeof medicalCentersTable.$inferSelect;
export type CenterClinic = typeof centerClinicsTable.$inferSelect;
