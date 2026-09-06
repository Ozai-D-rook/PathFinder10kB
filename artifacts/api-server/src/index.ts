import fs from "fs";
import path from "path";

// Auto-load workspace .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL && !process.env.SUPABASE_DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
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
    }
  } catch {
    // Ignore error
  }
}

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
