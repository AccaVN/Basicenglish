import Link from "next/link";
import { TOPICS } from "@/lib/content";

// Phrase content is static: it comes from data/phrases-500.json bundled with
// the app on Vercel (see src/lib/content.ts). This page needs no database.
export default function TopicsPage() {
  return (
    <main className="page-shell">
      <header className="page-header"><Link href="/" className="brand">Học Vui <span>English</span></Link><Link className="button button-secondary" href="/dashboard">Bảng học tập</Link></header>
      <section className="page-intro"><p className="eyebrow">BẮT ĐẦU TỪ NHỮNG ĐIỀU NHỎ</p><h1>Chủ đề học</h1><p>Chọn một bài ngắn, học cụm từ theo ngữ cảnh và ôn lại để ghi nhớ lâu hơn.</p></section>
      <div className="topic-list">
        {TOPICS.map((topic) => {
          return <section className="topic-card" key={topic.slug}>
            <div className="topic-card-heading"><div><p className="eyebrow">CHỦ ĐỀ</p><h2>{topic.name}</h2><p className="muted">{topic.description || "Cụm từ thông dụng trong đời sống."}</p></div><span className="count-pill">{topic.phraseCount} cụm từ</span></div>
            {topic.lessons.length ? <div className="lesson-list">{topic.lessons.map((lesson) => <Link href={`/learn/${lesson.slug}`} key={lesson.slug} className="lesson-row"><span className="lesson-icon">Aa</span><span className="lesson-copy"><strong>{lesson.title}</strong><small>{lesson.description || "Bài học ngắn dành cho người mới bắt đầu."}</small></span><span className="lesson-meta"><span>{lesson.phraseCount} thẻ</span><span>{lesson.level}</span></span><span className="lesson-arrow" aria-hidden="true">→</span></Link>)}</div> : <p className="empty-inline">Chủ đề này chưa có bài học.</p>}
          </section>;
        })}
      </div>
      <footer className="site-footer">Học Vui English · Học từng chút, tiến bộ mỗi ngày.</footer>
    </main>
  );
}
