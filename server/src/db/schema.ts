import { serial, text, pgTable, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Authors table
export const authorsTable = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Posts table
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author_id: integer('author_id').references(() => authorsTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Define relations
export const authorsRelations = relations(authorsTable, ({ many }) => ({
  posts: many(postsTable),
}));

export const postsRelations = relations(postsTable, ({ one }) => ({
  author: one(authorsTable, {
    fields: [postsTable.author_id],
    references: [authorsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Author = typeof authorsTable.$inferSelect; // For SELECT operations
export type NewAuthor = typeof authorsTable.$inferInsert; // For INSERT operations

export type Post = typeof postsTable.$inferSelect; // For SELECT operations
export type NewPost = typeof postsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { 
  authors: authorsTable, 
  posts: postsTable 
};

export const allRelations = {
  authorsRelations,
  postsRelations
};