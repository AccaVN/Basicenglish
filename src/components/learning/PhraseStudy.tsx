"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type StudyPhrase = { id: string; phrase: string; meaningVi: string; exampleEn: string; exampleVi: string; audioUrl: string | null };
type Rating = "again" | "hard" | "good" | "easy";

const ratings: { value: Rating; label: string; hint: string; icon: string }[] = [
  { value: "again", label: "Quên rồi", hint: "Ôn lại sớm", icon: "↺" },
  { value: "hard", label: "Khó nhớ", hint: "Cần luyện thêm", icon: "⋯" },
  { value: "good", label: "Đã nhớ", hint: "Tôi nhớ được", icon: "✓" },
  { value: "easy", label: "Rất dễ", hint: "Nhớ khá chắc", icon: "★" },
];

export default function PhraseStudy({ lessonId, phrases }: { lessonId: string; phrases: StudyPhrase[] }) {
  void lessonId;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [xp, setXp] = useState(0);
  const [notice, setNotice] = useState("");
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [allDone, setAllDone] = useState(false);
  const current = phrases[index];
  const progress = useMemo(() => Math.round((completed / phrases.length) * 100), [completed, phrases.length]);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    if (current?.audioUrl) {
      const audio = new Audio(current.audioUrl);
      void audio.play().catch(() => setNotice("Không phát được audio. Bạn có thể thử lại hoặc dùng nút đọc bằng giọng máy."));
      return;
    }
    if (!("speechSynthesis" in window)) {
      setNotice("Trình duyệt này chưa hỗ trợ đọc văn bản. Hãy thử Chrome hoặc Edge.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }, [current]);

  useEffect(() => () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  async function rateCard(rating: Rating) {
    if (!current || busy) return;
    setBusy(true);
    setNotice("");
    try {
      const responseKey = crypto.randomUUID();
      const response = await fetch("/api/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phraseId: current.id, rating, responseKey }),
      });
      const result = await response.json();
      if (response.status === 401) { window.location.href = "/login"; return; }
      if (!response.ok) throw new Error(result.error || "Không lưu được kết quả ôn tập.");
      if (!result.duplicate) setXp((value) => value + (result.xp ?? 0));
      setCompleted((value) => value + 1);
      setKnown((value) => new Set(value).add(current.id));
      if (index < phrases.length - 1) {
        setIndex((value) => value + 1);
        setRevealed(false);
      } else {
        setAllDone(true);
        setNotice("Bạn đã hoàn thành bài học này. Hãy ôn lại các thẻ khó nhớ hoặc chọn bài tiếp theo.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  function nextCard() {
    setIndex((value) => (value + 1) % phrases.length);
    setRevealed(false);
    setNotice("");
  }

  if (!current) return null;
  const finished = allDone;

  return <section className="study-area">
    <div className="study-progress-row"><span>Thẻ {Math.min(index + 1, phrases.length)} / {phrases.length}</span><span>{completed} đã ôn · +{xp} XP trong phiên</span></div>
    <div className="progress-track" role="progressbar" aria-valuenow={Math.min(100, progress)} aria-valuemin={0} aria-valuemax={100}><div className="progress-fill" style={{ width: `${Math.min(100, progress)}%` }} /></div>
    {finished ? <div className="completion-card"><div className="completion-icon">✓</div><p className="eyebrow">HOÀN THÀNH BÀI HỌC</p><h2>Làm tốt lắm!</h2><p>Bạn đã ôn {completed} lượt trong bài này và nhận {xp} XP trong phiên học.</p><div className="completion-actions"><button className="button button-primary" onClick={() => { setIndex(0); setRevealed(false); setCompleted(0); setXp(0); setAllDone(false); setKnown(new Set()); setNotice(""); }}>Học lại bài này</button><Link className="button button-secondary" href="/review">Ôn tập đến hạn</Link><Link className="button button-secondary" href="/topics">Chọn bài khác</Link></div></div> : <>
      <article className={`flashcard ${revealed ? "is-revealed" : ""}`}>
        <div className="flashcard-top"><span className="flashcard-tag">CỤM TỪ TIẾNG ANH</span><button type="button" className="icon-button" onClick={() => speak(current.phrase)} aria-label="Nghe phát âm" title="Nghe phát âm">🔊</button></div>
        <div className="flashcard-main"><h2>{current.phrase}</h2><p className="flashcard-prompt">{revealed ? "Nghĩa và ví dụ" : "Hãy thử đoán nghĩa trước khi lật thẻ"}</p></div>
        {revealed ? <div className="flashcard-answer"><div><span className="answer-label">NGHĨA TIẾNG VIỆT</span><p className="meaning-text">{current.meaningVi}</p></div><div className="example-box"><span className="answer-label">VÍ DỤ</span><p className="example-en">{current.exampleEn}<button type="button" className="inline-speak" onClick={() => speak(current.exampleEn)} aria-label="Nghe ví dụ">🔊</button></p><p className="example-vi">{current.exampleVi}</p></div></div> : <button className="button button-primary reveal-button" onClick={() => setRevealed(true)}>Hiện nghĩa và ví dụ <span>↓</span></button>}
        <div className="flashcard-bottom"><span>Gợi ý: nghe phát âm trước khi tự đánh giá.</span><span>{known.has(current.id) ? "Đã ôn thẻ này" : "Thẻ học mới / ôn tập"}</span></div>
      </article>
      {revealed ? <div className="rating-panel"><p className="rating-title">Bạn nhớ cụm từ này đến mức nào?</p><div className="rating-grid">{ratings.map((rating) => <button type="button" key={rating.value} className={`rating-button rating-${rating.value}`} disabled={busy} onClick={() => void rateCard(rating.value)}><span className="rating-icon">{rating.icon}</span><strong>{rating.label}</strong><small>{rating.hint}</small></button>)}</div><p className="rating-footnote">Lịch ôn tiếp theo sẽ được tự động điều chỉnh theo câu trả lời.</p></div> : <div className="study-secondary-actions"><button type="button" className="button button-secondary" onClick={() => speak(current.phrase)}>🔊 Nghe cụm từ</button><button type="button" className="button button-quiet" onClick={nextCard}>Bỏ qua thẻ →</button></div>}
    </>}
    {notice ? <div className={`notice ${notice.includes("hoàn thành") ? "notice-success" : "notice-info"}`} role="status">{notice}</div> : null}
    {busy ? <p className="loading-note" role="status">Đang lưu kết quả ôn tập…</p> : null}
  </section>;
}
