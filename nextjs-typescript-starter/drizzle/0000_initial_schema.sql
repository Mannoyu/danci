CREATE TABLE IF NOT EXISTS "books" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "word_count" integer DEFAULT 0 NOT NULL,
  "cover_url" text,
  "book_id" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "tags" text
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "learning_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "book_id" text NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "current_word_rank" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "learning_progress_user_book_unique" UNIQUE("user_id", "book_id")
);

CREATE INDEX IF NOT EXISTS "books_book_id_idx" ON "books" ("book_id");
CREATE INDEX IF NOT EXISTS "words_book_id_idx" ON "words" ("bookId");
CREATE INDEX IF NOT EXISTS "words_book_id_rank_idx" ON "words" ("bookId", "wordRank");
