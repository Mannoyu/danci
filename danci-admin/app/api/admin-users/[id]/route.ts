import { NextResponse } from "next/server";
import { z } from "zod";
import { database } from "@/lib/db";
import { getSessionUser } from "@/lib/session";

const updateSchema = z.object({ status: z.enum(["正常", "停用"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.role !== "超级管理员") return NextResponse.json({ error: "只有超级管理员可以修改成员状态" }, { status: 403 });

  const { id } = await params;
  const adminId = Number(id);
  if (!Number.isInteger(adminId)) return NextResponse.json({ error: "管理员编号无效" }, { status: 400 });
  if (adminId === session.id) return NextResponse.json({ error: "不能停用当前登录账号" }, { status: 400 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "账号状态无效" }, { status: 400 });
  const result = database.prepare("UPDATE admin_users SET status = ? WHERE id = ?").run(parsed.data.status, adminId);
  if (result.changes === 0) return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
  if (parsed.data.status === "停用") database.prepare("DELETE FROM sessions WHERE admin_user_id = ?").run(adminId);
  return NextResponse.json({ ok: true });
}
