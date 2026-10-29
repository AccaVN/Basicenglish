"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";
import { SENTENCE_SETS } from "@/lib/sentence-sets";

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

export default function SentencePractice() {
  const [setId, setSetId] = useState(SENTENCE_SETS[0]?.id ?? "basic");
  const [cover, setCover] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const set = SENTENCE_SETS.find((s) => s.id === setId) ?? SENTENCE_SETS[0];
  if (!set) return <p className="empty-inline">Chưa có bộ luyện câu.</p>;

  function selectSet(id: string) {
    setSetId(id);
    setRevealed(new Set());
  }

  return (
    <section className="study-area">
      <p className="muted">
        Tiến độ ở trang này chỉ tính trong phiên học hiện tại, không lưu vào cơ sở dữ liệu và không cộng XP.
        Phiên âm chỉ mang tính tham khảo.
      </p>
      <div className="study-secondary-actions" style={{ justifyContent: "flex-start" }}>
        {SENTENCE_SETS.map((s) => (
          <button
            type="button"
            key={s.id}
            className={`button ${s.id === setId ? "button-primary" : "button-secondary"}`}
            onClick={() => selectSet(s.id)}
          >
            {s.id === "basic" ? "Bộ 1 · Cơ bản" : "Bộ 2 · Mẫu câu khó hơn"} ({s.items.length} câu)
          </button>
        ))}
        <label className="button button-secondary" style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={cover} onChange={(e) => setCover(e.target.checked)} /> Che tiếng Anh, tự nói trước
        </label>
      </div>
      <p className="muted">
        {set.labelVi} · {set.level} · Đã mở {revealed.size} / {set.items.length} câu
      </p>
      {set.items.map((item, i) => {
        const hidden = cover && !revealed.has(i);
        return (
          <article className="example-box extras-item" key={i}>
            <p className="muted">
              {i + 1}. {item.tag} · {item.termVi}
            </p>
            {hidden ? (
              <div>
                <p className="example-vi">Tiếng Anh đang được che — hãy tự nói câu này trước, rồi bấm hiện câu.</p>
                <button type="button" className="button button-secondary" onClick={() => setRevealed((s) => new Set(s).add(i))}>
                  Hiện câu tiếng Anh
                </button>
              </div>
            ) : (
              <div>
                <p className="example-en">
                  {boldTerm(item.en, item.termEn)}
                  <button type="button" className="inline-speak" onClick={() => speak(item.en)} aria-label="Nghe câu">
                    🔊
                  </button>
                </p>
                <p className="example-vi">{item.ipa}</p>
              </div>
            )}
            <p className="example-vi">{item.vi}</p>
          </article>
        );
      })}
    </section>
  );
}
