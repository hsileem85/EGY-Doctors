import { pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  patientUserId: integer("patient_user_id"),
  patientName: varchar("patient_name", { length: 255 }).notNull(),
  rating: integer("rating").notNull(),
  text: text("text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = typeof insertReviewSchema._type;
export type Review = typeof reviewsTable.$inferSelect;
