import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { user } from "../../drizzle/schema";

export const posts = pgTable(
  "posts",
  {
    id: serial().primaryKey(),
    authorId: text().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Add index for better query performance
    index("posts_authorId_idx").using(
      "btree",
      table.authorId.asc().nullsLast().op("text_ops"),
    ),
    // Add foreign key constraint to user table
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [user.id],
      name: "posts_authorId_fkey",
    }).onDelete("cascade"), // Deletes posts when user is deleted
  ],
);

export type Post = typeof posts.$inferSelect; // for reading
export type NewPost = typeof posts.$inferInsert; // for inserting

export const news = pgTable("news", {
  id: serial().primaryKey(),
  title: text().notNull(),
  content: text().notNull(),
  imageCover: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type News = typeof news.$inferSelect;
export type NewNews = typeof news.$inferInsert;

export const comment = pgTable(
  "comments",
  {
    id: serial().primaryKey(),
    postId: integer("post_id"),
    newsId: integer("news_id"),
    authorId: text().notNull(),
    content: text().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("comments_post_id_idx").using(
      "btree",
      table.postId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_news_id_idx").using(
      "btree",
      table.newsId.asc().nullsLast().op("int4_ops"),
    ),
    index("comments_author_id_idx").using(
      "btree",
      table.authorId.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.postId],
      foreignColumns: [posts.id],
      name: "comments_post_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.newsId],
      foreignColumns: [news.id],
      name: "comments_news_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.authorId],
      foreignColumns: [user.id],
      name: "comments_author_id_fkey",
    }).onDelete("cascade"),
  ],
);

export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;

export const postsRelations = relations(posts, ({ many }) => ({
  comment: many(comment),
}));

export const newsRelations = relations(news, ({ many }) => ({
  comment: many(comment),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(posts, {
    fields: [comment.postId],
    references: [posts.id],
  }),
  news: one(news, {
    fields: [comment.newsId],
    references: [news.id],
  }),
}));
