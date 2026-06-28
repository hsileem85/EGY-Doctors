import { pgTable, serial, integer, text, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { magazinePostsTable } from "./magazine_posts";
import { usersTable } from "./users";

export const magazinePostLikesTable = pgTable("magazine_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => magazinePostsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  uniqPostUser: uniqueIndex("magazine_post_likes_post_user_idx").on(t.postId, t.userId),
}));

export type MagazinePostLike = typeof magazinePostLikesTable.$inferSelect;

export const magazinePostCommentsTable = pgTable("magazine_post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => magazinePostsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MagazinePostComment = typeof magazinePostCommentsTable.$inferSelect;
