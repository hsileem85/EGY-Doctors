import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { doctorsTable } from "./doctors";
import { medicalCentersTable } from "./medical_centers";

export const doctorFollowsTable = pgTable("doctor_follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  doctorId: integer("doctor_id").references(() => doctorsTable.id, { onDelete: "cascade" }),
  medicalCenterId: integer("medical_center_id").references(() => medicalCentersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqFollowerDoctor: uniqueIndex("doctor_follows_follower_doctor_idx").on(t.followerId, t.doctorId),
}));

export type DoctorFollow = typeof doctorFollowsTable.$inferSelect;
