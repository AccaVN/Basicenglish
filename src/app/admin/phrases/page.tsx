import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userRoles } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { TOPICS, PHRASES } from "@/lib/content";

// Read-only content overview. Phrase content is static JSON bundled on
// Vercel (data/phrases-500.json) — it is NOT edited in the database anymore,
// so this page has no create/update/delete actions. To change phrases, edit
// data/phrases-500.json (and data/phrases-500.csv as an editing aid), run
// `npm run content:validate`, commit and redeploy on Vercel.
export default async function AdminPhrasesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!db) return <main className="p-8">Chưa cấu hình DATABASE_URL.</main>;
  const [role] = await db.select({ id: userRoles.id }).from(userRoles).where(and(eq(userRoles.userId, session.user.id), eq(userRoles.role, "admin"))).limit(1);
  if (!role) redirect("/dashboard");
  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-10"><a href="/dashboard" className="text-sm font-semibold text-blue-700">← Bảng học tập</a><h1 className="mt-4 text-3xl font-black">Nội dung cụm từ (chỉ xem)</h1><p className="mt-2 text-slate-600">Chỉ admin được phép sử dụng. Tổng cộng {PHRASES.length} cụm từ trong {TOPICS.length} chủ đề.</p>
    <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-xl font-bold">Cách sửa cụm từ trong bản này</h2><p className="mt-2 text-slate-700">Cụm từ không còn lưu trong database. Để sửa, hãy sửa file <code>data/phrases-500.json</code> (file <code>data/phrases-500.csv</code> chỉ là bản hỗ trợ biên tập, cần đồng bộ tay với JSON), chạy <code>npm run content:validate</code> để kiểm tra 500 cụm từ và ID ổn định, sau đó commit và deploy lại trên Vercel. Việc sửa ở đây không còn áp dụng cho trang học, vì trang học đọc trực tiếp từ file JSON đi kèm bản deploy.</p><p className="mt-2 text-slate-700">ID ổn định của mỗi cụm từ có dạng <code>topicSlug/lessonSlug/001</code>, ví dụ <code>greetings-introductions/basic-greetings/001</code>. Neon chỉ lưu tiến độ SRS, lịch ôn, XP, hoạt động ngày và lượt luyện nói — không lưu nội dung cụm từ.</p></section>
    <section className="mt-6 space-y-4">{TOPICS.map((topic) => <details key={topic.slug} className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-bold">{topic.name} <span className="ml-2 text-sm font-normal text-slate-500">· {topic.phraseCount} cụm từ</span></summary><div className="mt-3 space-y-2">{topic.lessons.map((lesson) => <div key={lesson.slug} className="rounded-xl bg-slate-50 p-3"><strong>{lesson.title}</strong><span className="ml-2 text-sm text-slate-500">· {lesson.phraseCount} thẻ · {lesson.level} · /learn/{lesson.slug}</span><p className="mt-1 text-sm text-slate-600">{lesson.phrases.slice(0, 3).map((p) => p.phrase).join(" · ")}{lesson.phrases.length > 3 ? " · …" : ""}</p></div>)}</div></details>)}</section>
  </main>;
}
