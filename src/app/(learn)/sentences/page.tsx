import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import SentencePractice from "@/components/learning/SentencePractice";

export const dynamic = "force-dynamic";

export default async function SentencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="page-shell study-shell">
      <header className="page-header">
        <Link href="/topics" className="brand">
          Học Vui <span>English</span>
        </Link>
        <Link href="/dashboard" className="button button-quiet">
          Bảng học tập
        </Link>
      </header>
      <div className="study-breadcrumb">
        <Link href="/topics">Chủ đề học</Link>
        <span>/</span>
        <span>Luyện câu theo mẫu</span>
      </div>
      <section className="page-intro study-intro">
        <p className="eyebrow">LUYỆN CÂU THEO MẪU</p>
        <h1>Luyện câu tiếng Anh</h1>
        <p>
          Mỗi câu dạy một từ hoặc một mẫu câu mới được tô đậm. Bộ 1 học từ theo chủ đề quen thuộc, bộ 2 học mẫu câu
          khó hơn như giới từ, so sánh, liên từ và câu hỏi lịch sự. Bật chế độ che tiếng Anh để tự nói trước rồi mới
          đối chiếu.
        </p>
      </section>
      <SentencePractice />
    </main>
  );
}
