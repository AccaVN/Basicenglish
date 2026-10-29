"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { speak } from "@/lib/speech";
import type { LessonExtras } from "@/lib/lesson-extras";

function boldTerm(text: string, term: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (!term || idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <strong>{text.slice(idx, idx + term.length)}</strong>
      {text.slice(idx + term.length)}
    </>
  );
}

export default function LessonExtras({ lessonSlug, extras }: { lessonSlug: string; extras: LessonExtras }) {
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [writing, setWriting] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [savedNote, setSavedNote] = useState("");

  const storageKey = `lesson-writing:${lessonSlug}`;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) setWriting(saved);
    } catch {
      // Local-only draft: failure must not break the lesson.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonSlug]);

  function saveWriting() {
    try {
      window.localStorage.setItem(storageKey, writing);
      setSavedNote("Đã lưu bản nháp trong trình duyệt này. Bài viết không được lưu lên máy chủ và không được chấm điểm tự động.");
    } catch {
      setSavedNote("Không lưu được bản nháp trong trình duyệt này.");
    }
  }

  const wordCount = writing.trim() ? writing.trim().split(/\s+/).length : 0;

  return (
    <section className="extras-section" aria-label="Bài tập thêm của bài học">
      <h2>Bài tập thêm</h2>
      <p className="muted">
        Phần này không thay đổi lịch ôn SRS hay điểm XP. Câu hỏi mở không được chấm điểm tự động — bạn tự đối chiếu với đáp án mẫu.
        Phiên âm chỉ mang tính tham khảo.
      </p>

      <div className="topic-card extras-card">
        <div className="topic-card-heading">
          <div>
            <p className="eyebrow">MỤC TIÊU KỸ NĂNG</p>
            <h3>{extras.skillEn}</h3>
            <p className="muted">{extras.skillVi}</p>
          </div>
        </div>
      </div>

      <h3>Câu hỏi mở — tự trả lời rồi đối chiếu đáp án mẫu</h3>
      {extras.openQuestions.map((q, i) => {
        const revealed = revealedAnswers.has(i);
        return (
          <article className="example-box extras-item" key={i}>
            <p className="example-en">
              {i + 1}. {q.qEn}
            </p>
            <p className="example-vi">{q.qVi}</p>
            {revealed ? (
              <div>
                <p className="example-en">Đáp án mẫu: {q.aEn}</p>
                <p className="example-vi">{q.aVi}</p>
              </div>
            ) : (
              <button type="button" className="button button-secondary" onClick={() => setRevealedAnswers((s) => new Set(s).add(i))}>
                Hiện đáp án mẫu
              </button>
            )}
          </article>
        );
      })}

      <h3>Trắc nghiệm khái niệm — chọn đáp án để xem giải thích ngay</h3>
      {extras.conceptMcqs.map((mcq, i) => {
        const chosen = mcqAnswers[i];
        return (
          <article className="example-box extras-item" key={i}>
            <p className="example-en">
              {i + 1}. {mcq.qEn}
            </p>
            <p className="example-vi">{mcq.qVi}</p>
            <div className="extras-options">
              {mcq.options.map((opt, j) => {
                const isChosen = chosen === j;
                const isCorrect = j === mcq.correctIndex;
                const cls = chosen === undefined ? "" : isCorrect ? "extras-option-correct" : isChosen ? "extras-option-wrong" : "";
                return (
                  <button
                    type="button"
                    key={j}
                    className={`extras-option ${cls}`}
                    onClick={() => setMcqAnswers((prev) => ({ ...prev, [i]: j }))}
                  >
                    <strong>{String.fromCharCode(65 + j)}.</strong> {opt.en} <span className="muted">({opt.vi})</span>
                  </button>
                );
              })}
            </div>
            {chosen !== undefined ? (
              <p className="example-vi">
                {chosen === mcq.correctIndex ? "✓ Đúng rồi. " : "Chưa đúng. "}
                {mcq.explanationEn} {mcq.explanationVi}
              </p>
            ) : null}
          </article>
        );
      })}

      <h3>Viết — 2–3 câu theo gợi ý</h3>
      <article className="example-box extras-item">
        <p className="example-en">{extras.writing.promptEn}</p>
        <p className="example-vi">{extras.writing.promptVi}</p>
        <textarea
          className="extras-textarea"
          rows={5}
          value={writing}
          onChange={(e) => setWriting(e.target.value)}
          placeholder="Viết bài của bạn ở đây…"
          aria-label="Bài viết của bạn"
        />
        <p className="muted">{wordCount} từ · Bài viết chỉ lưu trong trình duyệt này, không được chấm điểm tự động.</p>
        <div className="study-secondary-actions" style={{ justifyContent: "flex-start" }}>
          <button type="button" className="button button-primary" onClick={saveWriting}>
            Lưu bản nháp
          </button>
          <button type="button" className="button button-secondary" onClick={() => setShowModel((v) => !v)}>
            {showModel ? "Ẩn bài mẫu" : "Xem bài mẫu"}
          </button>
        </div>
        {savedNote ? <p className="notice notice-info">{savedNote}</p> : null}
        {showModel ? (
          <div>
            <p className="example-en">
              {extras.writing.modelEn}
              <button type="button" className="inline-speak" onClick={() => speak(extras.writing.modelEn)} aria-label="Nghe bài mẫu">
                🔊
              </button>
            </p>
            <p className="example-vi">{extras.writing.modelIpa}</p>
            <p className="example-vi">{extras.writing.modelVi}</p>
          </div>
        ) : null}
      </article>

      <h3>Nói theo mẫu — nghe rồi nói lại</h3>
      {extras.speakModels.map((m, i) => (
        <article className="example-box extras-item" key={i}>
          <p className="example-en">
            {boldTerm(m.en, m.termEn)}
            <button type="button" className="inline-speak" onClick={() => speak(m.en)} aria-label="Nghe câu mẫu">
              🔊
            </button>
          </p>
          <p className="example-vi">{m.ipa}</p>
          <p className="example-vi">{m.vi}</p>
        </article>
      ))}

      <p>
        <Link href="/sentences">Luyện câu theo mẫu →</Link>
      </p>
    </section>
  );
}
