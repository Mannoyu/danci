import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, words } from "@/app/db/index";
export const revalidate = 60;
export async function GET(_request: Request, { params }: { params: { wordId: string } }) { const [word] = await db.select().from(words).where(eq(words.id, Number(params.wordId))).limit(1); return word ? NextResponse.json({ word }, { headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" } }) : NextResponse.json({ error: "单词不存在" }, { status: 404 }); }
