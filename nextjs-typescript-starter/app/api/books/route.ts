import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db, books } from "@/app/db/index";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET() {
  try {
    const rows = await db.select().from(books).orderBy(asc(books.createdAt));
    return NextResponse.json({ books: rows }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" } });
  } catch (error) {
    console.error("Failed to load books", error);
    return NextResponse.json({ error: "单词书加载失败，请稍后重试" }, { status: 500 });
  }
}
