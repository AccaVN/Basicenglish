import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NODE_ENV !== "test") {
  // Fail early on server use, while allowing build tooling to import modules.
  console.warn("DATABASE_URL is not configured. Database calls will not work until it is set.");
}

const globalForDb = globalThis as unknown as { neonPool?: Pool };
const pool = globalForDb.neonPool ?? (connectionString ? new Pool({ connectionString }) : undefined);
if (pool && process.env.NODE_ENV !== "production") globalForDb.neonPool = pool;

export const db = pool ? drizzle(pool, { schema }) : null;
export { schema };
