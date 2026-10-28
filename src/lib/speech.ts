// Browser-only helpers for speaking practice.
// No paid AI API is used anywhere in speaking: the browser's Web Speech API
// reads the sample aloud and transcribes what the learner says, and the code
// below compares the recognised words with the target sentence.
export function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  synth.speak(u);
}

type RecogCtor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function getSpeechRecognition(): RecogCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, RecogCtor | undefined>;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function hasSpeechRecognition(): boolean {
  return getSpeechRecognition() !== null;
}

// Normalise for a forgiving comparison: lowercase, strip punctuation.
export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Simple word-overlap similarity (0-100). Not an AI pronunciation score:
// it compares what the browser recognised with the target sentence.
export function similarityScore(target: string, transcript: string): { score: number; missing: string[]; extra: string[] } {
  const t = normalise(target).split(" ").filter(Boolean);
  const h = new Set(normalise(transcript).split(" ").filter(Boolean));
  if (t.length === 0) return { score: 0, missing: [], extra: [] };
  const missing = t.filter((w) => !h.has(w));
  const heard = normalise(transcript).split(" ").filter(Boolean);
  const extra = heard.filter((w) => !t.includes(w));
  const score = Math.round(((t.length - missing.length) / t.length) * 100);
  return { score, missing, extra };
}

export type SpeakingTurnInput = {
  turnIndex: number;
  targetText: string;
  transcript: string;
  score: number;
  missing: string[];
};

/** Best-effort save of a speaking attempt. Failures are swallowed on purpose:
 *  the learner must still see their score even if the database is down. */
export async function saveSpeakingAttempt(input: {
  mode: "shadowing" | "roleplay";
  scenarioTitle: string;
  turns: SpeakingTurnInput[];
}): Promise<void> {
  try {
    await fetch("/api/speaking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    // Intentionally ignored: speaking feedback is local-first.
  }
}
