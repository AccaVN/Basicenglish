import Link from "next/link";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { dailyActivity, userPhraseProgress, xpEvents } from "@/lib/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getPhraseById } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  let totalXp = 0, dueCount = 0, reviewedCount = 0, activeDays = 0;
  if (db) {
    const [xp] = await db.select({ total: sql<number>`coalesce(sum(${xpEvents.points}), 0)` }).from(xpEvents).where(eq(xpEvents.userId, session.user.id));
    // Due count: progress rows in Neon, filtered in code to slugs that still
    // exist in the static JSON (phrase text is not in the database anymore).
    const dueRows = await db.select({ phraseId: userPhraseProgress.phraseId }).from(userPhraseProgress).where(and(eq(userPhraseProgress.userId, session.user.id), lte(userPhraseProgress.nextReviewAt, new Date())));
    const dueCountValue = dueRows.filter((row) => getPhraseById(row.phraseId) !== undefined).length;
    const [reviews] = await db.select({ total: sql<number>`coalesce(sum(${dailyActivity.reviewsCompleted}), 0)` }).from(dailyActivity).where(eq(dailyActivity.userId, session.user.id));
    const [days] = await db.select({ total: sql<number>`count(*)` }).from(dailyActivity).where(and(eq(dailyActivity.userId, session.user.id), gte(dailyActivity.activityDate, new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10))));
    totalXp = Number(xp?.total ?? 0); dueCount = dueCountValue; reviewedCount = Number(reviews?.total ?? 0); activeDays = Number(days?.total ?? 0);
  }
  return <main className="page-shell">
    <header className="page-header"><Link href="/" className="brand">Học Vui <span>English</span></Link><span className="user-email">{session.user.email}</span></header>
    <section className="page-intro dashboard-intro"><p className="eyebrow">BẢNG HỌC TẬP</p><h1>Chào mừng bạn quay lại!</h1><p>Mỗi ngày một chút, bạn sẽ tự tin hơn khi sử dụng tiếng Anh.</p></section>
    <section className="stats-grid"><article className="stat-card"><span className="stat-icon">✦</span><span className="stat-label">Tổng XP</span><strong>{totalXp}</strong><small>Điểm tích lũy</small></article><article className="stat-card"><span className="stat-icon">↻</span><span className="stat-label">Thẻ đến hạn</span><strong>{dueCount}</strong><small>Cần ôn hôm nay</small></article><article className="stat-card"><span className="stat-icon">✓</span><span className="stat-label">Lượt ôn</span><strong>{reviewedCount}</strong><small>Tổng lượt đã hoàn thành</small></article><article className="stat-card"><span className="stat-icon">☀</span><span className="stat-label">Ngày hoạt động</span><strong>{activeDays}/7</strong><small>Trong 7 ngày gần đây</small></article></section>
    <section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow">TIẾP TỤC HÀNH TRÌNH</p><h2>Bạn muốn học gì hôm nay?</h2></div></div><div className="activity-grid">{[{title:"Học cụm từ",desc:"Học theo chủ đề, xem ví dụ và nghe phát âm.",href:"/topics",icon:"Aa",label:"Khám phá bài học"},{title:"Ôn tập hôm nay",desc:dueCount ? `Bạn có ${dueCount} thẻ đang chờ ôn tập.` : "Ôn các cụm từ đến hạn để ghi nhớ lâu hơn.",href:"/review",icon:"↻",label:"Bắt đầu ôn tập"},{title:"Luyện nói",desc:"Bắt đầu với chế độ nghe và đọc theo câu mẫu.",href:"/speaking",icon:"♫",label:"Mở phòng luyện nói"}].map((item)=><Link key={item.title} href={item.href} className="activity-card"><span className="activity-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.desc}</p><span className="activity-link">{item.label} →</span></Link>)}</div></section>
    <footer className="site-footer">Học Vui English · Tiến bộ từng ngày.</footer>
  </main>;
}
