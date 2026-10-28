"use client";

import { useMemo, useState } from "react";
import {
  getSpeechRecognition,
  hasSpeechRecognition,
  saveSpeakingAttempt,
  similarityScore,
  speak,
} from "@/lib/speech";

export type SpeakingPhrase = {
  phrase: string;
  meaningVi: string;
  topic: string;
};

export default function Shadowing({ phrases }: { phrases: SpeakingPhrase[] }) {
  const topics = useMemo(
    () => Array.from(new Set(phrases.map((p) => p.topic))).sort(),
    [phrases],
  );
  const [topic, setTopic] = useState(topics[0] ?? "");
  const list = useMemo(
    () => phrases.filter((p) => p.topic === topic),
    [phrases, topic],
  );
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ score: number; missing: string[] } | null>(null);
  const [error, setError] = useState("");
  const supported = hasSpeechRecognition();
  const cur = list.length ? list[idx % list.length] : undefined;

  const check = (text: string) => {
    if (!cur || !text.trim()) return;
    setTranscript(text);
    const r = similarityScore(cur.phrase, text);
    setResult(r);
    void saveSpeakingAttempt({
      mode: "shadowing",
      scenarioTitle: cur.topic,
      turns: [{ turnIndex: 0, targetText: cur.phrase, transcript: text, score: r.score, missing: r.missing }],
    });
  };

  const record = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome/Edge trên máy tính, hoặc gõ câu trả lời bên dưới.");
      return;
    }
    setError("");
    setResult(null);
    setTranscript("");
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    setListening(true);
    rec.onresult = (e) => {
      check(e.results[0][0].transcript);
      setListening(false);
    };
    rec.onerror = () => {
      setError("Không nghe rõ. Hãy thử lại, nói chậm và rõ hơn, hoặc gõ câu trả lời.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  if (!cur) return <div className="empty-state"><h2>Chưa có cụm từ để luyện nói</h2><p>Quản trị viên cần xuất bản cụm từ trước.</p></div>;

  return (
    <section className="study-area">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label htmlFor="shadowing-topic" style={{ fontWeight: 800, fontSize: 13 }}>Chọn chủ đề:</label>
        <select
          id="shadowing-topic"
          value={topic}
          onChange={(e) => { setTopic(e.target.value); setIdx(0); setResult(null); setTranscript(""); }}
          style={{ minHeight: 42, padding: "10px 12px", border: "1px solid #dbe3ef", borderRadius: 12, background: "white" }}
        >
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <p className="muted" style={{ lineHeight: 1.7 }}>Bước 1: Nghe câu mẫu. Bước 2: Nhấn “Nói lại” và đọc to câu đó. App so sánh lời bạn nói với câu mẫu.</p>
      <article className="flashcard" style={{ minHeight: 0 }}>
        <div className="flashcard-top"><span className="flashcard-tag">CÂU MẪU · {cur.topic}</span><button type="button" className="icon-button" onClick={() => speak(cur.phrase)} aria-label="Nghe câu mẫu">🔊</button></div>
        <div className="flashcard-main" style={{ paddingBottom: 12 }}><h2>“{cur.phrase}”</h2><p className="flashcard-prompt">{cur.meaningVi}</p></div>
        <div className="study-secondary-actions" style={{ justifyContent: "center" }}>
          <button type="button" className="button button-secondary" onClick={() => speak(cur.phrase)}>🔊 Nghe câu mẫu</button>
          <button type="button" className="button button-primary" onClick={record} disabled={listening}>{listening ? "🎙️ Đang nghe..." : "🎙️ Nói lại"}</button>
          <button type="button" className="button button-secondary" onClick={() => { setIdx((i) => (i + 1) % list.length); setResult(null); setTranscript(""); }}>Câu khác →</button>
        </div>
      </article>
      {error && <div className="notice notice-info" role="status">{error}</div>}
      {!supported && (
        <div className="notice notice-warning" role="status">
          Trình duyệt này không hỗ trợ nhận diện giọng nói (Web Speech API). Hãy mở bằng Chrome hoặc Edge, hoặc dùng ô gõ bên dưới để kiểm tra.
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        <label htmlFor="shadowing-typed" style={{ fontWeight: 800, fontSize: 13 }}>Hoặc gõ câu bạn muốn nói:</label>
        <input
          id="shadowing-typed"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder="Type the English sentence here..."
          style={{ display: "block", width: "100%", minHeight: 42, marginTop: 8, padding: "10px 12px", border: "1px solid #dbe3ef", borderRadius: 12, background: "white" }}
        />
        <button type="button" className="button button-secondary" style={{ marginTop: 8 }} onClick={() => check(typed)}>Kiểm tra câu đã gõ</button>
      </div>
      {transcript && <p style={{ lineHeight: 1.6 }}><strong>Trình duyệt nghe được:</strong> “{transcript}”</p>}
      {result && (
        <div className={`notice ${result.score >= 80 ? "notice-success" : "notice-info"}`} role="status">
          <strong>Điểm khớp: {result.score}/100</strong>
          {result.score >= 80 ? " — Tuyệt vời! Lời bạn nói khớp tốt với câu mẫu." : " — Chưa khớp lắm, hãy nghe lại và nói chậm hơn."}
          {result.missing.length > 0 && <p style={{ margin: "8px 0 0" }}>Từ còn thiếu hoặc chưa nhận diện được: <strong>{result.missing.join(", ")}</strong></p>}
        </div>
      )}
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.7 }}>Lưu ý: đây là điểm so sánh từ mà trình duyệt nhận diện được, không phải điểm phát âm của AI chuyên sâu. Kết quả được lưu vào lịch sử luyện nói khi đã đăng nhập và có kết nối database (nếu lưu thất bại, bạn vẫn thấy điểm ngay trên trang này).</p>
    </section>
  );
}
