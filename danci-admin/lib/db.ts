import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dataDirectory = path.join(process.cwd(), "data");
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new Database(path.join(dataDirectory, "lexicon.db"));
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT '草稿',
    updated_at TEXT NOT NULL
  );
`);

const bookCount = database.prepare("SELECT COUNT(*) AS count FROM books").get() as { count: number };
if (bookCount.count === 0) {
  const insert = database.prepare("INSERT INTO books (id, title, category, word_count, status, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
  const seed = database.transaction(() => {
    insert.run("BK-001", "大学英语四级核心词汇", "考试", 1248, "已发布", "2026-08-24");
    insert.run("BK-002", "商务英语高频表达", "商务", 680, "草稿", "2026-08-22");
    insert.run("BK-003", "旅行场景实用词汇", "生活", 432, "已发布", "2026-08-18");
    insert.run("BK-004", "托福学术词汇精选", "考试", 1560, "已停用", "2026-08-12");
  });
  seed();
}

export { database };
