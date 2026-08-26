import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { bookSchema } from "@/lib/validation";

type BookRow = { id: string; title: string; category: string; word_count: number; status: string; updated_at: string };

export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const rows = database.prepare("SELECT * FROM books ORDER BY updated_at DESC, id DESC").all() as BookRow[];
  return NextResponse.json({ books: rows.map(toBook) });
}

export async function POST(request: Request) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const parsed = bookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const latest = database.prepare("SELECT MAX(CAST(SUBSTR(id, 4) AS INTEGER)) AS number FROM books").get() as { number: number | null };
  const id = `BK-${String((latest.number ?? 0) + 1).padStart(3, "0")}`;
  const updatedAt = new Date().toISOString().slice(0, 10);
  database.prepare("INSERT INTO books (id, title, category, word_count, status, updated_at) VALUES (?, ?, ?, 0, '草稿', ?)")
    .run(id, parsed.data.title, parsed.data.category, updatedAt);

  return NextResponse.json({ book: { id, ...parsed.data, words: 0, status: "草稿", updatedAt } }, { status: 201 });
}

function toBook(row: BookRow) {
  return { id: row.id, title: row.title, category: row.category, words: row.word_count, status: row.status, updatedAt: row.updated_at };
}
