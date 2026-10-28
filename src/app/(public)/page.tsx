import Link from "next/link";

const features = [
  { number: "01", title: "Học cụm từ theo ngữ cảnh", description: "Cụm từ thực tế, nghĩa tiếng Việt, ví dụ dễ hiểu và phát âm chậm." },
  { number: "02", title: "Ôn tập đúng thời điểm", description: "Flashcard và lịch ôn thông minh giúp bạn nhớ lâu hơn mỗi ngày." },
  { number: "03", title: "Tiến bộ từng bước", description: "Tích lũy XP, theo dõi tiến độ và chuẩn bị cho hành trình luyện nói." },
];

export default function HomePage() {
  return <main className="page-shell">
    <header className="page-header"><Link className="brand" href="/">Học Vui <span>English</span></Link><Link className="button button-secondary" href="/login">Đăng nhập</Link></header>
    <section className="hero-grid">
      <div className="hero-copy"><p className="eyebrow">TIẾNG ANH CHO NGƯỜI MỚI BẮT ĐẦU</p><h1>Học tiếng Anh mỗi ngày, từng cụm từ một.</h1><p>Xây nền tảng tiếng Anh thực tế với những cụm từ thông dụng, bài học ngắn và lịch ôn giúp bạn ghi nhớ lâu hơn.</p><div className="hero-actions"><Link className="button button-primary" href="/login">Bắt đầu học <span>→</span></Link><Link className="button button-secondary" href="/topics">Khám phá chủ đề</Link></div><div className="hero-proof"><span>✓</span> Bài học ngắn · Dễ hiểu · Học theo tốc độ của bạn</div></div>
      <div className="hero-card"><div className="hero-card-head"><span className="hero-dot"/><span>CỤM TỪ MẪU</span><span className="hero-level">A1</span></div><div className="hero-phrase">Could you help me?</div><p className="hero-translation">Bạn có thể giúp tôi không?</p><div className="hero-example"><span>VÍ DỤ</span><strong>Could you help me find the station?</strong><p>Bạn có thể giúp tôi tìm nhà ga không?</p></div><div className="hero-card-foot"><span>🔊 Nghe phát âm</span><span>✦ + XP</span></div></div>
    </section>
    <section className="feature-section"><div className="section-heading"><p className="eyebrow">CÁCH HỌC</p><h2>Tiến bộ nhờ những bước nhỏ</h2></div><div className="feature-grid">{features.map((feature) => <article className="feature-card" key={feature.number}><span className="feature-number">{feature.number}</span><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div></section>
    <section className="bottom-cta"><div><p className="eyebrow">SẴN SÀNG BẮT ĐẦU?</p><h2>Chỉ cần vài phút mỗi ngày.</h2><p>Chọn chủ đề đầu tiên và học theo nhịp độ của bạn.</p></div><Link className="button button-primary" href="/topics">Xem bài học <span>→</span></Link></section>
    <footer className="site-footer">Học Vui English · Học từng chút, tiến bộ mỗi ngày.</footer>
  </main>;
}
