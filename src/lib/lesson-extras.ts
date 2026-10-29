// Per-lesson extras adapted from a Primary English lesson pattern
// (skill goal + open questions + concept MCQs + writing + speaking models),
// with adult TOEIC/workplace content. No DB, no XP, no auto-grading here:
// open questions are self-checked against a model answer, concept MCQs give
// instant local feedback only, and writing is saved in the browser only.
// IPA in this file is reference-only, same General American convention as
// data/phrases-500.json.

import rawExtras from "../../data/lesson-extras.json";

export type OpenQuestion = { qEn: string; qVi: string; aEn: string; aVi: string };
export type ConceptMcqOption = { en: string; vi: string };
export type ConceptMcq = {
  qEn: string;
  qVi: string;
  options: ConceptMcqOption[];
  correctIndex: number;
  explanationEn: string;
  explanationVi: string;
};
export type LessonWriting = {
  promptEn: string;
  promptVi: string;
  modelEn: string;
  modelVi: string;
  modelIpa: string;
};
export type SpeakModel = { termEn: string; en: string; vi: string; ipa: string };

export type LessonExtras = {
  lessonSlug: string;
  skillEn: string;
  skillVi: string;
  openQuestions: OpenQuestion[];
  conceptMcqs: ConceptMcq[];
  writing: LessonWriting;
  speakModels: SpeakModel[];
};

const extras = rawExtras as LessonExtras[];
const extrasBySlug = new Map(extras.map((e) => [e.lessonSlug, e]));

export const LESSON_EXTRAS: LessonExtras[] = extras;

export function getLessonExtras(slug: string): LessonExtras | undefined {
  return extrasBySlug.get(slug);
}
