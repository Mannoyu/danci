import { NextResponse } from "next/server";
import { database } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { publicSignUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = publicSignUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const exists = database.prepare("SELECT 1 FROM admin_users WHERE email = ?").get(parsed.data.email);
  if (exists) return NextResponse.json({ error: "该邮箱已经注册" }, { status: 409 });

  const result = database.prepare(`
    INSERT INTO admin_users (name, email, password_hash, role, status, created_at)
    VALUES (?, ?, ?, '内容管理员', '正常', ?)
  `).run(parsed.data.name, parsed.data.email, hashPassword(parsed.data.password), new Date().toISOString());

  await createSession(Number(result.lastInsertRowid));
  return NextResponse.json({ ok: true }, { status: 201 });
}
