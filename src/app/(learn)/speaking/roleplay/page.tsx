import Link from "next/link";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";
import Roleplay from "@/components/speaking/Roleplay";
import { DIALOGUES } from "@/lib/dialogues";

export default async function RoleplayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="page-shell study-shell">
      <header className="page-header">
        <Link href="/speaking" className="brand">Học Vui <span>English</span></Link>
        <Link href="/dashboard" className="button button-quiet">Bảng học tập</Link>
      </header>
      <div className="study-breadcrumb"><Link href="/speaking">Luyện nói</Link><span>/</span><span>Hội thoại mẫu</span></div>
      <section className="page-intro study-intro">
        <p className="eyebrow">LUYỆN NÓI · HỘI THOẠI MẪU</p>
        <h1>Hội thoại mẫu</h1>
        <p>{DIALOGUES.length} hội thoại viết sẵn, mỗi hội thoại 8 lượt. Bạn đóng vai B, nói đúng câu trả lời đã cho sẵn — không phải trò chuyện tự do với AI.</p>
      </section>
      <Roleplay dialogues={DIALOGUES} />
    </main>
  );
}
