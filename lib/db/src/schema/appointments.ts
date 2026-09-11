import { pgTable, serial, integer, varchar, date, timestamp, text, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";
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
  completedAt: timestamp("completed_at", { withTimezone: true }),
}, (table) => [
  index("appointments_patient_status_idx").on(table.patientUserId, table.status),
  index("appointments_completed_at_idx").on(table.completedAt),
]);

export const reminderKindEnum = ["24h", "1h"] as const;
export const appointmentReminderDeliveriesTable = pgTable("appointment_reminder_deliveries", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointmentsTable.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: reminderKindEnum }).notNull(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("appointment_reminder_appointment_kind_unique").on(table.appointmentId, table.kind),
]);

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = typeof insertAppointmentSchema.type;
export type Appointment = typeof appointmentsTable.$inferSelect;
