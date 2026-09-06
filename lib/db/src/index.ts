import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// Auto-load .env if connectionString is missing
if (!process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL) {
  try {
    let currentDir = process.cwd();
    while (currentDir) {
      const envPath = path.join(currentDir, ".env");
      if (fs.existsSync(envPath)) {
        const dotenvContent = fs.readFileSync(envPath, "utf8");
        dotenvContent.split(/\r?\n/).forEach((line) => {
          const parts = line.split("=");
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim();
            if (key && !key.startsWith("#") && !process.env[key]) {
              process.env[key] = value;
            }
          }
        });
        break;
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
  } catch {
    // Ignore error
  }
}

const { Pool } = pg;

const connectionString =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL must be set.");
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
