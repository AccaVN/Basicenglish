"use client";

import { useMemo, useState } from "react";
import {
  getSpeechRecognition,
  saveSpeakingAttempt,
  similarityScore,
  speak,
  type SpeakingTurnInput,
} from "@/lib/speech";
import type { Dialogue } from "@/lib/dialogues";

export default function Roleplay({ dialogues }: { dialogues: Dialogue[] }) {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const dialogue = dialogues[dialogueIndex];
  const [turn, setTurn] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{ score: number; missing: string[] } | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState<SpeakingTurnInput[]>([]);

  const userTurns = useMemo(
    () => (dialogue ? dialogue.turns.map((t, i) => ({ ...t, index: i })).filter((t) => t.speaker === "B") : []),
    [dialogue],
  );

  if (!dialogue) return <div className="empty-state"><h2>Chưa có hội thoại</h2><p>Hội thoại mẫu chưa được nạp.</p></div>;

  // Even turns: character A speaks. Odd turns (speaker B): the learner speaks.
  const aiTurn = turn % 2 === 0;
  const current = dialogue.turns[turn];

  const check = (text: string) => {
    if (!text.trim()) return;
    setTranscript(text);
    const r = similarityScore(current.en, text);
    setResult(r);
    setAttempts((prev) => [...prev, { turnIndex: turn, targetText: current.en, transcript: text, score: r.score, missing: r.missing }]);
  };

  const finish = (finalAttempts: SpeakingTurnInput[]) => {
    setDone(true);
    if (finalAttempts.length) {
      void saveSpeakingAttempt({ mode: "roleplay", scenarioTitle: dialogue.title, turns: finalAttempts });
    }
  };

  const next = () => {
    setResult(null);
    setTranscript("");
    setTyped("");
    if (turn + 1 < dialogue.turns.length) setTurn(turn + 1);
    else finish(attempts);
  };

  const record = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome/Edge, hoặc gõ câu trả lời bên dưới.");
      return;
    }
    setError("");
    setResult(null);
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
      setError("Không nghe rõ. Hãy thử lại hoặc gõ câu trả lời.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const resetDialogue = (index: number) => {
    setDialogueIndex(index);
    setTurn(0);
    setDone(false);
    setResult(null);
    setTranscript("");
    setTyped("");
    setAttempts([]);
    setError("");
  };

  return (
    <section className="study-area">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label htmlFor="roleplay-dialogue" style={{ fontWeight: 800, fontSize: 13 }}>Chọn hội thoại:</label>
        <select
          id="roleplay-dialogue"
          value={dialogueIndex}
          onChange={(e) => resetDialogue(Number(e.target.value))}
          style={{ minHeight: 42, padding: "10px 12px", border: "1px solid #dbe3ef", borderRadius: 12, background: "white" }}
        >
          {dialogues.map((d, i) => <option key={d.title} value={i}>{d.title}</option>)}
        </select>
      </div>
      <h2 style={{ margin: "18px 0 6px" }}>{dialogue.title}</h2>
      <p className="muted" style={{ lineHeight: 1.7 }}>Tình huống: {dialogue.situation}</p>
      <p className="muted" style={{ lineHeight: 1.7 }}><strong>Đây là hội thoại viết sẵn, không phải trò chuyện tự do với AI.</strong> Bạn đóng vai B, nói đúng câu trả lời đã cho sẵn. Bạn cần nói {userTurns.length} lượt.</p>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {dialogue.turns.slice(0, turn + 1).map((t, i) => (
          <p key={i} style={{ margin: 0, padding: 12, borderRadius: 12, background: i === turn ? "#eff6ff" : "#f9fafb", lineHeight: 1.6 }}>
            <strong>{t.speaker}:</strong> {t.en} <span className="muted">— {t.vi}</span>
          </p>
        ))}
      </div>
      {!done && aiTurn && (
        <div style={{ marginTop: 18 }}>
          <p style={{ lineHeight: 1.6 }}><strong>Nhân vật A nói:</strong> “{current.en}” — {current.vi}</p>
          <div className="study-secondary-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="button button-secondary" onClick={() => speak(current.en)}>🔊 Nghe nhân vật nói</button>
            <button type="button" className="button button-primary" onClick={next}>Tiếp theo →</button>
          </div>
        </div>
      )}
      {!done && !aiTurn && (
        <div style={{ marginTop: 18 }}>
          <p style={{ lineHeight: 1.6 }}><strong>Đến lượt bạn (vai {current.speaker}). Hãy nói câu này:</strong></p>
          <p style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>“{current.en}”</p>
          <p className="muted">{current.vi}</p>
          <div className="study-secondary-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="button button-secondary" onClick={() => speak(current.en)}>🔊 Nghe câu mẫu</button>
            <button type="button" className="button button-primary" onClick={record} disabled={listening}>{listening ? "🎙️ Đang nghe..." : "🎙️ Nói câu trả lời"}</button>
          </div>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Hoặc gõ câu trả lời tiếng Anh..."
            style={{ display: "block", width: "100%", minHeight: 42, marginTop: 12, padding: "10px 12px", border: "1px solid #dbe3ef", borderRadius: 12, background: "white" }}
          />
          <button type="button" className="button button-secondary" style={{ marginTop: 8 }} onClick={() => check(typed)}>Kiểm tra câu đã gõ</button>
          {error && <div className="notice notice-info" role="status">{error}</div>}
          {transcript && <p style={{ lineHeight: 1.6 }}><strong>Trình duyệt nghe được:</strong> “{transcript}”</p>}
          {result && (
            <div className={`notice ${result.score >= 60 ? "notice-success" : "notice-info"}`} role="status">
              <strong>Điểm khớp: {result.score}/100</strong>
              {result.score >= 60 ? " — Tốt! Chuyển sang câu tiếp theo." : " — Chưa khớp, hãy nghe lại và nói chậm hơn."}
              {result.missing.length > 0 && <p style={{ margin: "8px 0 0" }}>Từ còn thiếu: <strong>{result.missing.join(", ")}</strong></p>}
              {result.score >= 60 && <div style={{ marginTop: 10 }}><button type="button" className="button button-primary" onClick={next}>Câu tiếp theo →</button></div>}
            </div>
          )}
        </div>
      )}
      {done && (
        <div className="completion-card">
          <div className="completion-icon">✓</div>
          <p className="eyebrow">HOÀN THÀNH HỘI THOẠI</p>
          <h2>🎉 Hoàn thành hội thoại!</h2>
          <p>Bạn đã luyện xong tình huống “{dialogue.title}”. Kết quả các lượt của bạn đã được gửi lưu (nếu database sẵn sàng).</p>
          <div className="completion-actions">
            <button type="button" className="button button-primary" onClick={() => resetDialogue(dialogueIndex)}>Luyện lại</button>
          </div>
        </div>
      )}
    </section>
  );
}
