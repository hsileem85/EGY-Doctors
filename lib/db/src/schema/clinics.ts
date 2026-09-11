import { pgTable, serial, integer, varchar, text, doublePrecision, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { availabilityPeriodEnum } from "./doctors.js";

export const bookingConfirmationMethodEnum = ["automatic", "manual"] as const;

export const clinicsTable = pgTable("clinics", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  areaId: integer("area_id"),
  address: text("address"),
  mapUrl: text("map_url"),
  phone: varchar("phone", { length: 50 }),
  fee: integer("fee"),
  followUpDays: integer("follow_up_days").default(15),
  followUpPrice: integer("follow_up_price"),
  bookingConfirmationMethod: text("booking_confirmation_method").notNull().default("automatic"),
  acceptedPaymentMethods: text("accepted_payment_methods").array().notNull().default(["CASH", "CARD", "WALLET"]),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  schedule: text("schedule"),
  availabilityPeriod: text("availability_period", { enum: availabilityPeriodEnum }),
  availabilityFrom: date("availability_from"),
  availabilityTo: date("availability_to"),
  sessionsPerHour: integer("sessions_per_hour"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClinicSchema = createInsertSchema(clinicsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClinic = typeof insertClinicSchema.type;
export type Clinic = typeof clinicsTable.$inferSelect;
