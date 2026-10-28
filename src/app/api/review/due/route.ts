import { NextResponse } from "next/server";
import { and, asc, eq, lte } from "drizzle-orm";
import { auth } from "../../../../../auth";
import { db } from "@/lib/db";
import { userPhraseProgress } from "@/lib/db/schema";
import { getPhraseById, phraseToStudy } from "@/lib/content";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  // Progress rows live in Neon; phrase text lives in static JSON. Map slugs
  // to JSON phrases in code and skip slugs no longer present in JSON.
  const rows = await db.select({ phraseId: userPhraseProgress.phraseId, nextReviewAt: userPhraseProgress.nextReviewAt })
    .from(userPhraseProgress)
    .where(and(eq(userPhraseProgress.userId, session.user.id), lte(userPhraseProgress.nextReviewAt, new Date())))
    .orderBy(asc(userPhraseProgress.nextReviewAt)).limit(50);
  const items = rows
    .map((row) => {
      const phrase = getPhraseById(row.phraseId);
      return phrase ? { ...phraseToStudy(phrase), nextReviewAt: row.nextReviewAt } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  return NextResponse.json({ items, count: items.length });
}
