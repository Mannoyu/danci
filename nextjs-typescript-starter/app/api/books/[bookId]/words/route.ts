import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { books, db, words } from "@/app/db/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { bookId: string } }) {
  try {
    const [book] = await db.select().from(books).where(eq(books.bookId, params.bookId)).limit(1);
    if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
    const rows = await db.select().from(words).where(eq(words.bookId, params.bookId)).orderBy(asc(words.wordRank));
    return NextResponse.json({ book, words: rows });
  } catch (error) {
    console.error("Failed to load book words", error);
    return NextResponse.json({ error: "单词数据加载失败，请稍后重试" }, { status: 500 });
  }
}
