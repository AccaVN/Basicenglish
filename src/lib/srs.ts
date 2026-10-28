export type ReviewRating = "again" | "hard" | "good" | "easy";
export type SrsState = { repetitions: number; intervalDays: number; easeFactor: number };

// Starter SM-2-inspired scheduler. Replace with a tested FSRS implementation before optimizing at scale.
export function scheduleNextReview(state: SrsState, rating: ReviewRating): SrsState {
  const ease = state.easeFactor / 100;
  if (rating === "again") return { repetitions: 0, intervalDays: 0, easeFactor: Math.max(130, state.easeFactor - 20) };
  if (rating === "hard") return { repetitions: state.repetitions + 1, intervalDays: Math.max(1, Math.round(Math.max(1, state.intervalDays) * 1.2)), easeFactor: Math.max(130, state.easeFactor - 15) };
  if (rating === "good") {
    const intervalDays = state.repetitions === 0 ? 1 : state.repetitions === 1 ? 3 : Math.max(1, Math.round(Math.max(1, state.intervalDays) * ease));
    return { repetitions: state.repetitions + 1, intervalDays, easeFactor: state.easeFactor };
  }
  const intervalDays = state.repetitions === 0 ? 2 : state.repetitions === 1 ? 4 : Math.max(1, Math.round(Math.max(1, state.intervalDays) * ease * 1.3));
  return { repetitions: state.repetitions + 1, intervalDays, easeFactor: Math.min(350, state.easeFactor + 15) };
}
