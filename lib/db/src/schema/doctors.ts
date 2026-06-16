import { pgTable, serial, text, varchar, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const doctorStatusEnum = ["pending", "approved", "rejected"] as const;
export const doctorOnboardingEnum = ["pending", "approved", "rejected"] as const;

export const doctorsTable = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  specialtyId: integer("specialty_id"),
  cityId: integer("city_id"),
  areaId: integer("area_id"),
  clinicAddress: text("clinic_address"),
  bio: text("bio"),
  image: text("image"),
  fee: integer("fee"),
  experience: integer("experience"),
  license: varchar("license", { length: 100 }),
  rating: doublePrecision("rating").default(0),
  reviews: integer("reviews").default(0),
  accountStatus: text("account_status", { enum: doctorStatusEnum }).notNull().default("pending"),
  onboardingStatus: text("onboarding_status", { enum: doctorOnboardingEnum }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDoctorSchema = createInsertSchema(doctorsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDoctor = typeof insertDoctorSchema.type;
export type Doctor = typeof doctorsTable.$inferSelect;
