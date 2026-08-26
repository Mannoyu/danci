import { and, count, eq, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { getSessionUser } from "@/lib/session";
import { updateAdminSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (session.role !== "system_admin") return NextResponse.json({ error: "无权修改管理员" }, { status: 403 });

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "管理员编号无效" }, { status: 400 });
  const parsed = updateAdminSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(753117)`);
    const [target] = await tx.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    if (!target) return { error: "管理员不存在", status: 404 } as const;
    if (id === session.id && (parsed.data.role !== "system_admin" || parsed.data.status !== "active")) {
      return { error: "不能降级或停用当前登录账号", status: 400 } as const;
    }

    if (target.role === "system_admin" && target.status === "active" && (parsed.data.role !== "system_admin" || parsed.data.status !== "active")) {
      const [remaining] = await tx.select({ value: count() }).from(adminUsers).where(and(
        eq(adminUsers.role, "system_admin"),
        eq(adminUsers.status, "active"),
        ne(adminUsers.id, id),
      ));
      if ((remaining?.value ?? 0) === 0) return { error: "系统必须保留至少一个可用的系统管理员", status: 400 } as const;
    }

    const [duplicate] = await tx.select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.email, parsed.data.email), ne(adminUsers.id, id))).limit(1);
    if (duplicate) return { error: "该邮箱已经存在", status: 409 } as const;

    const [admin] = await tx.update(adminUsers).set({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      status: parsed.data.status,
      updatedAt: new Date(),
    }).where(eq(adminUsers.id, id)).returning({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email,
      role: adminUsers.role,
      status: adminUsers.status,
      lastActive: adminUsers.lastActiveAt,
      createdAt: adminUsers.createdAt,
    });
    return { admin } as const;
  });

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });

  if (parsed.data.status === "disabled") {
    await db.delete(adminSessions).where(eq(adminSessions.adminUserId, id));
  }
  return NextResponse.json({ admin: result.admin });
}
