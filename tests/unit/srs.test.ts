import { describe, expect, it } from "vitest";
import { scheduleNextReview } from "../../src/lib/srs";

describe("scheduleNextReview", () => {
  it("schedules a forgotten phrase immediately", () => {
    expect(scheduleNextReview({ repetitions: 3, intervalDays: 8, easeFactor: 250 }, "again")).toEqual({ repetitions: 0, intervalDays: 0, easeFactor: 230 });
  });
  it("starts a new phrase with a short interval after a good answer", () => {
    expect(scheduleNextReview({ repetitions: 0, intervalDays: 0, easeFactor: 250 }, "good").intervalDays).toBe(1);
  });
  it("caps the ease factor", () => {
    expect(scheduleNextReview({ repetitions: 4, intervalDays: 20, easeFactor: 350 }, "easy").easeFactor).toBe(350);
  });
});
