import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions, adminUsers, type AdminRole } from "@/db/schema";

export const SESSION_COOKIE = "lexicon_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
};

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminUserId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(adminSessions).values({ adminUserId, tokenHash: digest(token), expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.adminUserId))
    .where(and(
      eq(adminSessions.tokenHash, digest(token)),
      gt(adminSessions.expiresAt, new Date()),
      eq(adminUsers.status, "active"),
    ))
    .limit(1);

  if (!row || (row.role !== "system_admin" && row.role !== "admin")) return null;
  return { ...row, role: row.role };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(adminSessions).where(eq(adminSessions.tokenHash, digest(token)));
  cookieStore.delete(SESSION_COOKIE);
}
