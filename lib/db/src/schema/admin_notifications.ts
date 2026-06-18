import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const adminNotificationsTable = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["new_patient", "new_doctor", "new_medical_center"] }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminNotification = typeof adminNotificationsTable.$inferSelect;
