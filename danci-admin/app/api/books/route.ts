import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { bookSchema } from "@/lib/validation";

export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const rows = await db.select().from(books).orderBy(desc(books.updatedAt));
  return NextResponse.json({ books: rows });
}

export async function POST(request: Request) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const parsed = bookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const [book] = await db.insert(books).values({
    id: crypto.randomUUID(),
    title: parsed.data.title,
    wordCount: parsed.data.wordCount,
    coverUrl: parsed.data.coverUrl || null,
    bookId: parsed.data.bookId || null,
    tags: parsed.data.tags || null,
  }).returning();

  return NextResponse.json({ book }, { status: 201 });
}
