import Link from "next/link";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import { PHRASES } from "@/lib/content";
import Shadowing from "@/components/speaking/Shadowing";

// Speaking phrases come only from the static JSON (src/lib/content.ts),
// bundled on Vercel. There is no database phrase query here anymore.
export default async function ShadowingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const speakingPhrases = PHRASES.map((p) => ({ phrase: p.phrase, meaningVi: p.meaningVi, topic: p.topic }));

  return (
    <main className="page-shell study-shell">
      <header className="page-header">
        <Link href="/speaking" className="brand">Học Vui <span>English</span></Link>
        <Link href="/dashboard" className="button button-quiet">Bảng học tập</Link>
      </header>
      <div className="study-breadcrumb"><Link href="/speaking">Luyện nói</Link><span>/</span><span>Nhại lại</span></div>
      <section className="page-intro study-intro">
        <p className="eyebrow">LUYỆN NÓI · NHẠI LẠI</p>
        <h1>Nhại lại câu mẫu</h1>
        <p>Nghe câu mẫu, nói lại và xem điểm khớp. Điểm này là so sánh từ của trình duyệt, không phải điểm phát âm AI chuyên sâu. Cụm từ lấy từ file JSON tĩnh đi kèm bản deploy trên Vercel.</p>
      </section>
      <Shadowing phrases={speakingPhrases} />
    </main>
  );
}
