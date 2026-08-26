import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/validation";

type AdminRecord = { id: number; password_hash: string; status: string };

export async function POST(request: Request) {
  const parsed = signInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const admin = database.prepare("SELECT id, password_hash, status FROM admin_users WHERE email = ?").get(parsed.data.email) as AdminRecord | undefined;
  if (!admin || !verifyPassword(parsed.data.password, admin.password_hash)) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }
  if (admin.status !== "正常") return NextResponse.json({ error: "该管理员账号已被停用" }, { status: 403 });

  database.prepare("UPDATE admin_users SET last_active = ? WHERE id = ?").run(new Date().toISOString(), admin.id);
  await createSession(admin.id);
  return NextResponse.json({ ok: true });
}
