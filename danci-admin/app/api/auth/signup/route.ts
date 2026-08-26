import { count, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { publicSignUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = publicSignUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(753116)`);
    const [result] = await tx.select({ value: count() }).from(adminUsers);
    if ((result?.value ?? 0) > 0) return null;

    const [admin] = await tx.insert(adminUsers).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: hashPassword(parsed.data.password),
      role: "system_admin",
      status: "active",
    }).returning({ id: adminUsers.id });
    return admin;
  });

  if (!created) {
    return NextResponse.json({ error: "系统管理员已经存在，请直接登录", redirectTo: "/signin" }, { status: 409 });
  }

  await createSession(created.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
