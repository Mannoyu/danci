import postgres, { type Sql } from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Keep one connection pool across Next.js hot reloads. Creating a new
// Supabase connection for every route module makes the first request stall.
const globalForDb = globalThis as typeof globalThis & { __danciSql?: Sql };
const client = globalForDb.__danciSql ?? postgres(connectionString, {
  prepare: false,
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10,
});
if (process.env.NODE_ENV !== "production") globalForDb.__danciSql = client;

export const db = drizzle(client, { schema });
export { client };
export * from "./schema";
