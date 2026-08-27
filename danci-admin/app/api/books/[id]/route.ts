import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books, words } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { bookSchema } from "@/lib/validation";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const parsed = bookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const [book] = await db.update(books)
    .set({
      title: parsed.data.title,
      wordCount: parsed.data.wordCount,
      coverUrl: parsed.data.coverUrl || null,
      bookId: parsed.data.bookId || null,
      tags: parsed.data.tags || null,
      updatedAt: new Date(),
    })
    .where(eq(books.id, id))
    .returning();

  if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  return NextResponse.json({ book });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  const [deleted] = await db.transaction(async (tx) => {
    const [book] = await tx.select().from(books).where(eq(books.id, id));
    if (!book) return [];

    if (book.bookId) {
      await tx.delete(words).where(eq(words.bookId, book.bookId));
    }

    return tx.delete(books).where(eq(books.id, id)).returning();
  });

  if (!deleted) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
