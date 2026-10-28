import Link from "next/link";
import { and, asc, eq, lte } from "drizzle-orm";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userPhraseProgress } from "@/lib/db/schema";
import { getPhraseById, LESSONS, phraseToStudy } from "@/lib/content";
import PhraseStudy from "@/components/learning/PhraseStudy";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!db) return <main className="page-shell"><div className="notice notice-warning">Chưa cấu hình DATABASE_URL.</div></main>;
  const now = new Date();
  // Progress lives in Neon, phrase text lives in static JSON: load the due
  // progress rows, then map each stable slug ID to its JSON phrase in code.
  // Rows whose slug no longer exists in JSON are skipped, never crash.
  const progressRows = await db.select({ phraseId: userPhraseProgress.phraseId, nextReviewAt: userPhraseProgress.nextReviewAt })
    .from(userPhraseProgress)
    .where(and(eq(userPhraseProgress.userId, session.user.id), lte(userPhraseProgress.nextReviewAt, now)))
    .orderBy(asc(userPhraseProgress.nextReviewAt)).limit(50);
  const dueRows = progressRows
    .map((row) => {
      const phrase = getPhraseById(row.phraseId);
      return phrase ? phraseToStudy(phrase) : null;
    })
    .filter((row): row is ReturnType<typeof phraseToStudy> => row !== null);
  const suggested = LESSONS.slice(0, 6);
  return <main className="page-shell study-shell">
    <header className="page-header"><Link href="/" className="brand">Học Vui <span>English</span></Link><Link href="/dashboard" className="button button-quiet">Bảng học tập</Link></header>
    <section className="page-intro"><p className="eyebrow">ÔN TẬP THÔNG MINH</p><h1>Ôn tập hôm nay</h1><p>Những cụm từ bạn đã học và đến hạn ôn sẽ xuất hiện tại đây.</p></section>
    {dueRows.length ? <PhraseStudy lessonId="review" phrases={dueRows} /> : <section className="empty-state"><div className="empty-state-icon">✦</div><h2>Chưa có thẻ đến hạn</h2><p>Hãy học một bài mới. Sau khi tự đánh giá mức độ ghi nhớ, cụm từ sẽ được lên lịch ôn tập tại đây.</p><div className="completion-actions"><Link className="button button-primary" href="/topics">Khám phá bài học</Link><Link className="button button-secondary" href="/dashboard">Về bảng học tập</Link></div>{suggested.length ? <div className="suggested-lessons"><h3>Bài học gợi ý</h3>{suggested.map((lesson) => <Link key={lesson.slug} href={`/learn/${lesson.slug}`} className="suggested-lesson"><span><strong>{lesson.title}</strong><small>{lesson.topicName}</small></span><span>→</span></Link>)}</div> : null}</section>}
  </main>;
}
