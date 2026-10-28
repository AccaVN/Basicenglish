import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { userPhraseProgress, reviewLogs, xpEvents, dailyActivity } from "@/lib/db/schema";
import { getPhraseById } from "@/lib/content";
import { reviewSchema } from "@/lib/validation/review";
import { scheduleNextReview } from "@/lib/srs";
import { and, eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });

  const { phraseId, rating, responseKey } = parsed.data;
  // Phrase content is static JSON, not a database row: validate the stable
  // slug ID against src/lib/content.ts instead of the removed phrases table.
  if (!getPhraseById(phraseId)) return NextResponse.json({ error: "phrase_not_found" }, { status: 404 });

  try {
    const result = await db.transaction(async (tx) => {
      const [insertedLog] = await tx.insert(reviewLogs).values({ userId: session.user.id, phraseId, rating, responseKey }).onConflictDoNothing().returning({ id: reviewLogs.id });
      if (!insertedLog) return { duplicate: true, xp: 0, nextReviewAt: null };

      const [current] = await tx.select().from(userPhraseProgress).where(and(eq(userPhraseProgress.userId, session.user.id), eq(userPhraseProgress.phraseId, phraseId))).limit(1);
      const next = scheduleNextReview({ repetitions: current?.repetitions ?? 0, intervalDays: current?.intervalDays ?? 0, easeFactor: current?.easeFactor ?? 250 }, rating);
      const now = new Date();
      const nextReviewAt = new Date(now.getTime() + next.intervalDays * 24 * 60 * 60 * 1000);

      if (current) {
        await tx.update(userPhraseProgress).set({ ...next, nextReviewAt, lastReviewedAt: now, lastRating: rating, updatedAt: now }).where(eq(userPhraseProgress.id, current.id));
      } else {
        await tx.insert(userPhraseProgress).values({ userId: session.user.id, phraseId, ...next, nextReviewAt, lastReviewedAt: now, lastRating: rating });
      }

      const points = rating === "again" ? 1 : rating === "hard" ? 2 : rating === "good" ? 3 : 4;
      await tx.insert(xpEvents).values({ userId: session.user.id, eventType: "review", sourceId: responseKey, points }).onConflictDoNothing();
      const day = now.toISOString().slice(0, 10);
      await tx.insert(dailyActivity).values({ userId: session.user.id, activityDate: day, reviewsCompleted: 1, xpEarned: points })
        .onConflictDoUpdate({ target: [dailyActivity.userId, dailyActivity.activityDate], set: {
          reviewsCompleted: sql`${dailyActivity.reviewsCompleted} + 1`,
          xpEarned: sql`${dailyActivity.xpEarned} + ${points}`,
        } });
      return { duplicate: false, xp: points, nextReviewAt: nextReviewAt.toISOString() };
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("review_submission_failed", error);
    return NextResponse.json({ error: "review_submission_failed" }, { status: 500 });
  }
}
