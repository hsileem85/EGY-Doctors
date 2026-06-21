import { pgTable, serial, integer, varchar, text, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertClinicSchema = createInsertSchema(clinicsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertClinic = typeof insertClinicSchema.type;
export type Clinic = typeof clinicsTable.$inferSelect;
