import { pgTable, serial, integer, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const postTypeEnum = pgEnum("post_type", ["article", "tip", "video"]);

export const magazinePostsTable = pgTable("magazine_posts", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull(),
  type: postTypeEnum("type").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content"),
  mediaUrl: varchar("media_url", { length: 2000 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MagazinePost = typeof magazinePostsTable.$inferSelect;
