import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { books, db } from "@/app/db/index";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET(_request: Request, { params }: { params: { bookId: string } }) {
  try {
    const [book] = await db.select().from(books).where(eq(books.bookId, params.bookId)).limit(1);
    if (!book) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
    return NextResponse.json({ book }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (error) {
    console.error("Failed to load book", error);
    return NextResponse.json({ error: "单词书加载失败，请稍后重试" }, { status: 500 });
  }
}
