import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set.",
  );
}

export const pool = new Pool({
  connectionString,
  ssl:
    process.env.SUPABASE_DATABASE_URL ||
    (!connectionString.includes("localhost") &&
      !connectionString.includes("127.0.0.1"))
      ? { rejectUnauthorized: false }
      : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
