import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { getSessionUser } from "@/lib/session";
import { adminSchema } from "@/lib/validation";

export async function GET() {
  const session = await requireSystemAdmin();
  if (session instanceof NextResponse) return session;

  const admins = await db.select({
    id: adminUsers.id,
    name: adminUsers.name,
    email: adminUsers.email,
    role: adminUsers.role,
    status: adminUsers.status,
    lastActive: adminUsers.lastActiveAt,
    createdAt: adminUsers.createdAt,
  }).from(adminUsers).orderBy(asc(adminUsers.createdAt));

  return NextResponse.json({ admins, currentUserId: session.id });
}

export async function POST(request: Request) {
  const session = await requireSystemAdmin();
  if (session instanceof NextResponse) return session;

  const parsed = adminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (existing) return NextResponse.json({ error: "该邮箱已经存在" }, { status: 409 });

  const [admin] = await db.insert(adminUsers).values({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    role: parsed.data.role,
    status: "active",
  }).returning({
    id: adminUsers.id,
    name: adminUsers.name,
    email: adminUsers.email,
    role: adminUsers.role,
    status: adminUsers.status,
    lastActive: adminUsers.lastActiveAt,
    createdAt: adminUsers.createdAt,
  });

  return NextResponse.json({ admin }, { status: 201 });
}

async function requireSystemAdmin() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.role !== "system_admin") return NextResponse.json({ error: "无权访问管理员管理" }, { status: 403 });
  return session;
}
