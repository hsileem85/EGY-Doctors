import { pgTable, serial, integer, varchar, date, timestamp, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const appointmentStatusEnum = ["pending", "confirmed", "cancelled", "completed", "pending_confirmation"] as const;

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  clinicId: integer("clinic_id"),
  patientUserId: integer("patient_user_id"),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  patientPhone: varchar("patient_phone", { length: 50 }).notNull(),
  appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
  appointmentTime: varchar("appointment_time", { length: 20 }).notNull(),
  status: text("status", { enum: appointmentStatusEnum }).notNull().default("pending"),
  notes: text("notes"),
  isFollowUp: boolean("is_follow_up").notNull().default(false),
  feeCharged: integer("fee_charged"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = typeof insertAppointmentSchema.type;
export type Appointment = typeof appointmentsTable.$inferSelect;
