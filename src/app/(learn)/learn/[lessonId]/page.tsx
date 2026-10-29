import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import { getLessonBySlug, phraseToStudy } from "@/lib/content";
import { getLessonExtras } from "@/lib/lesson-extras";
import PhraseStudy from "@/components/learning/PhraseStudy";
import LessonExtras from "@/components/learning/LessonExtras";

// URL scheme (static content): /learn/<lessonSlug>, e.g.
// /learn/basic-greetings. The old merged version used a database uuid here;
// those uuid URLs no longer exist, because phrases are no longer in Neon.
export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { lessonId } = await params;
  const lesson = getLessonBySlug(lessonId);
  if (!lesson) notFound();
  const rows = lesson.phrases.map(phraseToStudy);
  return <main className="page-shell study-shell">
    <header className="page-header"><Link href="/topics" className="brand">Học Vui <span>English</span></Link><Link href="/dashboard" className="button button-quiet">Bảng học tập</Link></header>
    <div className="study-breadcrumb"><Link href="/topics">Chủ đề học</Link><span>/</span><span>{lesson.topicName}</span></div>
    <section className="page-intro study-intro"><p className="eyebrow">{lesson.topicName} · {lesson.level}</p><h1>{lesson.title}</h1><p>{lesson.description || "Học các cụm từ thông dụng, xem ví dụ và tự đánh giá mức độ ghi nhớ."}</p></section>
    {rows.length ? <PhraseStudy lessonId={lesson.slug} phrases={rows} /> : <div className="empty-state"><h2>Bài học chưa có cụm từ</h2><p>Nội dung của bài học này nằm trong file data/phrases-500.json đi kèm với app.</p></div>}
    {(() => { const extras = getLessonExtras(lesson.slug); return extras ? <LessonExtras lessonSlug={lesson.slug} extras={extras} /> : null; })()}
  </main>;
}
