import { z } from "zod";

export const reviewSchema = z.object({
  // Stable static-content ID from src/lib/content.ts, e.g.
  // "greetings-introductions/basic-greetings/001" — not a uuid.
  phraseId: z.string().min(1).max(200),
  rating: z.enum(["again", "hard", "good", "easy"]),
  responseKey: z.string().min(8).max(100),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
