import {
  pgTable,
  serial,
  text,
  timestamp,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";

// Import the user table from drizzle schema
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
