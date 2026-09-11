import { pgTable, serial, integer, text, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { appointmentsTable } from "./appointments";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointmentsTable.id, { onDelete: "set null" }),
  doctorId: integer("doctor_id").notNull(),
  patientUserId: integer("patient_user_id"),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("reviews_appointment_id_unique").on(table.appointmentId),
]);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = typeof insertReviewSchema.type;
export type Review = typeof reviewsTable.$inferSelect;
