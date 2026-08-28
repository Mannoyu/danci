import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { books, db, words } from "@/app/db/index";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET(_request: Request, { params }: { params: { bookId: string } }) {
  try {
    const summary = new URL(_request.url).searchParams.get("summary") === "1";
    const [[book], rows] = await Promise.all([
      db.select({ id: books.id, title: books.title, wordCount: books.wordCount, coverUrl: books.coverUrl, bookId: books.bookId, tags: books.tags }).from(books).where(eq(books.bookId, params.bookId)).limit(1),
      summary
        ? db.select({ id: words.id, wordRank: words.wordRank, headWord: words.headWord }).from(words).where(eq(words.bookId, params.bookId)).orderBy(asc(words.wordRank))
        : db.select({ id: words.id, wordRank: words.wordRank, headWord: words.headWord, content: words.content }).from(words).where(eq(words.bookId, params.bookId)).orderBy(asc(words.wordRank)),
    ]);
    if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
    return NextResponse.json({ book, words: rows }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (error) {
    console.error("Failed to load book words", error);
    return NextResponse.json({ error: "单词数据加载失败，请稍后重试" }, { status: 500 });
  }
}
