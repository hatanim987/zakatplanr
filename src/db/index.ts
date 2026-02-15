import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Please add it to .env.local"
    );
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

// Lazy initialization — only connects when first queried
let _db: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) _db = createDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_db as any)[prop];
  },
});
