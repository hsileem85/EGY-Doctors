import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { doctorsTable } from "./doctors";

export const doctorFollowsTable = pgTable("doctor_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id").notNull().references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqFollowerDoctor: uniqueIndex("doctor_follows_follower_doctor_idx").on(t.followerId, t.doctorId),
}));

export type DoctorFollow = typeof doctorFollowsTable.$inferSelect;
