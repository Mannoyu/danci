import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const result = database.prepare("DELETE FROM books WHERE id = ?").run(id);
  if (result.changes === 0) return NextResponse.json({ error: "单词书不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
