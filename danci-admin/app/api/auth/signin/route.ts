import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { getAdminCount } from "@/lib/admins";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { signInSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if ((await getAdminCount()) === 0) {
    return NextResponse.json({ error: "请先注册首个系统管理员", redirectTo: "/signup" }, { status: 409 });
  }

  const parsed = signInSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return NextResponse.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }
  if (admin.status !== "active") return NextResponse.json({ error: "该管理员账号已被停用" }, { status: 403 });

  await db.update(adminUsers).set({ lastActiveAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
  await createSession(admin.id);
  return NextResponse.json({ ok: true });
}
