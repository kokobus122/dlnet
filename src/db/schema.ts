import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: serial().primaryKey(),
  authorId: text().notNull(),
  title: text().notNull(),
  content: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export type Post = typeof posts.$inferSelect  // for reading
export type NewPost = typeof posts.$inferInsert  // for inserting