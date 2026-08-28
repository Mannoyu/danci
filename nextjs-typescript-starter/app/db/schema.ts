import {
  bigint,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/** Existing word data maintained by the admin application. */
export const words = pgTable("words", {
  // The identity is already defined in Supabase; Drizzle only needs the column type/key.
  id: bigint("id", { mode: "number" }).primaryKey(),
  wordRank: integer("wordRank"),
  headWord: text("headWord"),
  content: json("content"),
  bookId: text("bookId"),
});

/** Book metadata. `bookId` is the business key used by words.bookId. */
export const books = pgTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  coverUrl: text("cover_url"),
  bookId: text("book_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  tags: text("tags"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const learningProgress = pgTable(
  "learning_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    currentWordRank: integer("current_word_rank").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userBookUnique: uniqueIndex("learning_progress_user_book_unique").on(table.userId, table.bookId),
  }),
);

export const userBookProgress = pgTable("user_book_progress", {
  id: serial("id").primaryKey(), userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), bookId: text("book_id").notNull().references(() => books.id, { onDelete: "cascade" }), currentWordRank: integer("current_word_rank").notNull().default(0), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ unique: uniqueIndex("user_book_progress_unique").on(table.userId, table.bookId) }));

export const userWordProgress = pgTable("user_word_progress", {
  id: serial("id").primaryKey(), userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), wordId: bigint("word_id", { mode: "number" }).notNull().references(() => words.id, { onDelete: "cascade" }), bookId: text("book_id").notNull(), completed: integer("completed").notNull().default(1), updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({ unique: uniqueIndex("user_word_progress_unique").on(table.userId, table.wordId) }));

// The existing words table stores the business key in `bookId`, so this
// relation intentionally joins it to books.bookId instead of books.id.
export const booksRelations = relations(books, ({ many }) => ({
  words: many(words, { relationName: "bookWords" }),
}));

export const wordsRelations = relations(words, ({ one }) => ({
  book: one(books, {
    fields: [words.bookId],
    references: [books.bookId],
    relationName: "bookWords",
  }),
}));

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Word = typeof words.$inferSelect;
export type User = typeof users.$inferSelect;
export type LearningProgress = typeof learningProgress.$inferSelect;
