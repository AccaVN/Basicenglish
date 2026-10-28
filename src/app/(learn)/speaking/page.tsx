import Link from "next/link";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export default async function SpeakingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return (
    <main className="page-shell">
      <header className="page-header">
        <Link href="/dashboard" className="brand">Học Vui <span>English</span></Link>
        <Link href="/dashboard" className="button button-quiet">Bảng học tập</Link>
      </header>
      <section className="page-intro">
        <p className="eyebrow">LUYỆN NÓI · KHÔNG CẦN API TRẢ PHÍ</p>
        <h1>Luyện nói</h1>
        <p>
          Nghe câu mẫu, nói lại và nhận điểm khớp ngay trên trình duyệt bằng Web Speech API.
          Đây là hội thoại mẫu viết sẵn và điểm so sánh từ, <strong>không phải trò chuyện tự do với AI
          và không phải điểm phát âm AI chuyên sâu</strong>. Muốn có trò chuyện tự do, cần thêm
          API key của nhà cung cấp AI sau này.
        </p>
        <p className="muted" style={{ lineHeight: 1.7 }}>
          Tốt nhất dùng Chrome hoặc Edge trên máy tính, cấp quyền micro, nói chậm và rõ ở nơi yên tĩnh.
          Nếu trình duyệt không hỗ trợ nhận diện giọng nói, bạn vẫn có thể gõ câu trả lời để kiểm tra.
        </p>
      </section>
      <section className="activity-grid">
        <Link href="/speaking/shadowing" className="activity-card">
          <span className="activity-icon">♫</span>
          <h3>Nhại lại (Shadowing)</h3>
          <p>Nghe cụm từ mẫu theo chủ đề, nói lại, xem điểm khớp và từ còn thiếu.</p>
          <span className="activity-link">Bắt đầu nhại lại →</span>
        </Link>
        <Link href="/speaking/roleplay" className="activity-card">
          <span className="activity-icon">💬</span>
          <h3>Hội thoại mẫu (Roleplay)</h3>
          <p>10 hội thoại viết sẵn, mỗi hội thoại 8 lượt. Bạn đóng vai B và nói câu trả lời cho sẵn.</p>
          <span className="activity-link">Bắt đầu hội thoại →</span>
        </Link>
        <Link href="/topics" className="activity-card">
          <span className="activity-icon">Aa</span>
          <h3>Học cụm từ trước</h3>
          <p>Ôn cụm từ bằng SRS rồi quay lại luyện nói để nhớ lâu hơn.</p>
          <span className="activity-link">Chọn bài học →</span>
        </Link>
      </section>
    </main>
  );
}
