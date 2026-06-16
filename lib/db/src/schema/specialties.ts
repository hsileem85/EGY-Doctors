import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const specialtiesTable = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: varchar("is_active", { length: 10 }).notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSpecialtySchema = createInsertSchema(specialtiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSpecialty = typeof insertSpecialtySchema.type;
export type Specialty = typeof specialtiesTable.$inferSelect;
