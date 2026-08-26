import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { database } from "@/lib/db";

export const SESSION_COOKIE = "lexicon_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

function digest(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminUserId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  database.prepare(`
    INSERT INTO sessions (id, admin_user_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(randomUUID(), adminUserId, digest(token), expiresAt.toISOString(), new Date().toISOString());

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

  const row = database.prepare(`
    SELECT admin_users.id, admin_users.name, admin_users.email, admin_users.role, admin_users.status, sessions.expires_at AS expiresAt
    FROM sessions
    JOIN admin_users ON admin_users.id = sessions.admin_user_id
    WHERE sessions.token_hash = ?
  `).get(digest(token)) as (SessionUser & { status: string; expiresAt: string }) | undefined;

  if (!row || row.status !== "正常" || new Date(row.expiresAt).getTime() <= Date.now()) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(digest(token));
  cookieStore.delete(SESSION_COOKIE);
}
