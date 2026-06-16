import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const areasTable = pgTable("areas", {
  id: serial("id").primaryKey(),
  cityId: integer("city_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("name_ar", { length: 100 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: varchar("is_active", { length: 10 }).notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAreaSchema = createInsertSchema(areasTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertArea = typeof insertAreaSchema.type;
export type Area = typeof areasTable.$inferSelect;
