import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { getSessionUser } from "@/lib/session";
import { adminSchema } from "@/lib/validation";

type AdminRow = { id: number; name: string; email: string; role: string; status: string; last_active: string | null };

export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const rows = database.prepare("SELECT id, name, email, role, status, last_active FROM admin_users ORDER BY id").all() as AdminRow[];
  return NextResponse.json({ admins: rows.map((row) => ({ ...row, lastActive: row.last_active, last_active: undefined })) });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.role !== "超级管理员") return NextResponse.json({ error: "只有超级管理员可以添加成员" }, { status: 403 });

  const parsed = adminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  if (database.prepare("SELECT 1 FROM admin_users WHERE email = ?").get(parsed.data.email)) {
    return NextResponse.json({ error: "该邮箱已经存在" }, { status: 409 });
  }

  const result = database.prepare(`
    INSERT INTO admin_users (name, email, password_hash, role, status, created_at)
    VALUES (?, ?, ?, ?, '正常', ?)
  `).run(parsed.data.name, parsed.data.email, hashPassword(parsed.data.password), parsed.data.role, new Date().toISOString());

  return NextResponse.json({
    admin: { id: Number(result.lastInsertRowid), name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, status: "正常", lastActive: null },
  }, { status: 201 });
}
