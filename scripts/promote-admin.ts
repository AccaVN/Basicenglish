import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { users, userRoles } from "../src/lib/db/schema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Usage: npm run admin:promote -- user@example.com");
  if (!db) throw new Error("DATABASE_URL is required.");
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) throw new Error(`No registered user found for ${email}. Sign in once first, then run this command.`);
  await db.insert(userRoles).values({ userId: user.id, role: "admin" }).onConflictDoNothing();
  console.log(`Admin role granted to ${email}.`);
  process.exit(0);
}
main().catch((error) => { console.error(error); process.exit(1); });
