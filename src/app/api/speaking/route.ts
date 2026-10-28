import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { speakingSessions, speakingTurns } from "@/lib/db/schema";

// Best-effort persistence for speaking practice, using the MVP's existing
// speaking_sessions / speaking_turns tables (no migration change).
// The schema has no numeric score column, so the word-match score is stored
// in the turn's feedback JSONB (pronunciation field) and summarised in the
// session summary. Clients must treat a non-200 response as "not saved" and
// still show the score on screen.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "database_not_configured" }, { status: 503 });

  const body = await request.json().catch(() => null) as {
    mode?: unknown;
    scenarioTitle?: unknown;
    turns?: unknown;
  } | null;
  if (!body || (body.mode !== "shadowing" && body.mode !== "roleplay")) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const scenarioTitle = typeof body.scenarioTitle === "string" ? body.scenarioTitle.slice(0, 200) : null;
  const rawTurns = Array.isArray(body.turns) ? body.turns : [];
  if (rawTurns.length === 0 || rawTurns.length > 50) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const turns = rawTurns.map((t, i) => {
    const turn = (t ?? {}) as Record<string, unknown>;
    const score = typeof turn.score === "number" && Number.isFinite(turn.score)
      ? Math.max(0, Math.min(100, Math.round(turn.score)))
      : 0;
    const missing = Array.isArray(turn.missing) ? turn.missing.filter((m): m is string => typeof m === "string") : [];
    return {
      turnIndex: typeof turn.turnIndex === "number" ? turn.turnIndex : i,
      targetText: typeof turn.targetText === "string" ? turn.targetText : "",
      transcript: typeof turn.transcript === "string" ? turn.transcript : "",
      score,
      missing,
    };
  });
  const avg = Math.round(turns.reduce((sum, t) => sum + t.score, 0) / turns.length);

  try {
    const [inserted] = await db.insert(speakingSessions).values({
      userId: session.user.id,
      mode: body.mode,
      status: "completed",
      scenarioTitle,
      completedAt: new Date(),
      summary: `Điểm khớp trung bình: ${avg}/100 qua ${turns.length} lượt. Điểm này là so sánh từ của Web Speech, không phải điểm phát âm AI chuyên sâu.`,
    }).returning({ id: speakingSessions.id });
    if (!inserted) throw new Error("session_insert_failed");
    await db.insert(speakingTurns).values(turns.map((t) => ({
      sessionId: inserted.id,
      turnIndex: t.turnIndex,
      targetText: t.targetText || null,
      transcript: t.transcript || null,
      feedback: {
        pronunciation: `Điểm khớp: ${t.score}/100`,
        correctedSentence: t.targetText || undefined,
        retryPrompt: t.missing.length ? `Từ còn thiếu: ${t.missing.join(", ")}` : undefined,
      },
    })));
    return NextResponse.json({ ok: true, sessionId: inserted.id, averageScore: avg });
  } catch (error) {
    console.error("speaking_save_failed", error);
    return NextResponse.json({ error: "speaking_save_failed" }, { status: 500 });
  }
}
