import "server-only";

import { count } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

export async function getAdminCount() {
  const [result] = await db.select({ value: count() }).from(adminUsers);
  return result?.value ?? 0;
}
