// Sentence practice sets: Set 1 is word-level, Set 2 is grammar-pattern
// level. Progress on this page is local state only: no DB, no XP.
// IPA is reference-only, same General American convention as
// data/phrases-500.json.

import rawSets from "../../data/sentence-sets.json";

export type SentenceItem = {
  tag: string;
  termEn: string;
  termVi: string;
  en: string;
  vi: string;
  ipa: string;
};

export type SentenceSet = {
  id: string;
  labelEn: string;
  labelVi: string;
  level: string;
  items: SentenceItem[];
};

export const SENTENCE_SETS: SentenceSet[] = rawSets as SentenceSet[];

export function getSentenceSet(id: string): SentenceSet | undefined {
  return SENTENCE_SETS.find((s) => s.id === id);
}
