// Validates data/lesson-extras.json and data/sentence-sets.json.
// This does NOT check IPA correctness (a program cannot judge pronunciation);
// it checks structure, counts, and cross-references against phrases-500.json.
// Exit 1 with a clear list on any violation.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const errors: string[] = [];
function fail(msg: string) {
  errors.push(msg);
}
function nonEmpty(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
function isIpa(v: unknown): v is string {
  return typeof v === "string" && v.startsWith("/") && v.endsWith("/") && v.length > 2;
}

type Phrase = { lessonSlug: string };
const phrases = JSON.parse(readFileSync(join(root, "data/phrases-500.json"), "utf-8")) as Phrase[];
const lessonSlugs = [...new Set(phrases.map((p) => p.lessonSlug))].sort();

const extras = JSON.parse(readFileSync(join(root, "data/lesson-extras.json"), "utf-8")) as any[];
if (!Array.isArray(extras)) fail("lesson-extras.json is not an array");
else {
  if (extras.length !== 23) fail(`lesson-extras: expected 23 entries, got ${extras.length}`);
  const slugs = extras.map((e) => e?.lessonSlug).sort();
  if (JSON.stringify(slugs) !== JSON.stringify(lessonSlugs)) {
    fail(`lesson-extras slugs do not exactly match phrases-500.json lessons. extras: ${slugs.join(", ")}; phrases: ${lessonSlugs.join(", ")}`);
  }
  for (const e of extras) {
    const id = e?.lessonSlug ?? "?";
    if (!nonEmpty(e?.skillEn) || !nonEmpty(e?.skillVi)) fail(`${id}: skillEn/skillVi must be non-empty`);
    if (!Array.isArray(e?.openQuestions) || e.openQuestions.length !== 3) fail(`${id}: openQuestions must be exactly 3`);
    else
      for (const [i, q] of e.openQuestions.entries())
        if (!nonEmpty(q?.qEn) || !nonEmpty(q?.qVi) || !nonEmpty(q?.aEn) || !nonEmpty(q?.aVi))
          fail(`${id}: openQuestions[${i}] all fields must be non-empty`);
    if (!Array.isArray(e?.conceptMcqs) || e.conceptMcqs.length !== 3) fail(`${id}: conceptMcqs must be exactly 3`);
    else {
      const corrects: number[] = [];
      for (const [i, m] of e.conceptMcqs.entries()) {
        if (!nonEmpty(m?.qEn) || !nonEmpty(m?.qVi)) fail(`${id}: conceptMcqs[${i}] question must be non-empty`);
        if (!Array.isArray(m?.options) || m.options.length !== 4) fail(`${id}: conceptMcqs[${i}] must have 4 options`);
        else
          for (const [j, o] of m.options.entries())
            if (!nonEmpty(o?.en) || !nonEmpty(o?.vi)) fail(`${id}: conceptMcqs[${i}] options[${j}] must be non-empty`);
        if (!Number.isInteger(m?.correctIndex) || m.correctIndex < 0 || m.correctIndex > 3)
          fail(`${id}: conceptMcqs[${i}] correctIndex must be 0-3`);
        else corrects.push(m.correctIndex);
        if (!nonEmpty(m?.explanationEn) || !nonEmpty(m?.explanationVi))
          fail(`${id}: conceptMcqs[${i}] explanations must be non-empty`);
      }
      if (corrects.length === 3 && new Set(corrects).size === 1)
        fail(`${id}: conceptMcqs correctIndex must vary within the lesson (all ${corrects[0]})`);
    }
    const w = e?.writing;
    if (!nonEmpty(w?.promptEn) || !nonEmpty(w?.promptVi) || !nonEmpty(w?.modelEn) || !nonEmpty(w?.modelVi))
      fail(`${id}: writing prompt/model must be non-empty`);
    if (!isIpa(w?.modelIpa)) fail(`${id}: writing modelIpa must start and end with '/'`);
    if (!Array.isArray(e?.speakModels) || e.speakModels.length !== 2) fail(`${id}: speakModels must be exactly 2`);
    else
      for (const [i, m] of e.speakModels.entries()) {
        if (!nonEmpty(m?.termEn) || !nonEmpty(m?.en) || !nonEmpty(m?.vi)) fail(`${id}: speakModels[${i}] must be non-empty`);
        if (typeof m?.en === "string" && typeof m?.termEn === "string" && !m.en.toLowerCase().includes(m.termEn.toLowerCase()))
          fail(`${id}: speakModels[${i}] termEn must appear in en`);
        if (!isIpa(m?.ipa)) fail(`${id}: speakModels[${i}] ipa must start and end with '/'`);
      }
  }
}

const sets = JSON.parse(readFileSync(join(root, "data/sentence-sets.json"), "utf-8")) as any[];
if (!Array.isArray(sets) || sets.length !== 2) fail(`sentence-sets: expected 2 sets, got ${Array.isArray(sets) ? sets.length : "non-array"}`);
else
  for (const s of sets) {
    const id = s?.id ?? "?";
    if (!nonEmpty(s?.labelEn) || !nonEmpty(s?.labelVi)) fail(`sentence-set ${id}: labels must be non-empty`);
    if (!Array.isArray(s?.items) || s.items.length !== 20) fail(`sentence-set ${id}: expected 20 items, got ${Array.isArray(s?.items) ? s.items.length : "non-array"}`);
    else
      for (const [i, it] of s.items.entries()) {
        if (!nonEmpty(it?.tag) || !nonEmpty(it?.termEn) || !nonEmpty(it?.termVi) || !nonEmpty(it?.en) || !nonEmpty(it?.vi))
          fail(`sentence-set ${id}[${i}]: all fields must be non-empty`);
        if (typeof it?.en === "string" && typeof it?.termEn === "string" && !it.en.toLowerCase().includes(it.termEn.toLowerCase()))
          fail(`sentence-set ${id}[${i}]: termEn must appear in en (termEn: ${it.termEn}, en: ${it.en})`);
        if (!isIpa(it?.ipa)) fail(`sentence-set ${id}[${i}]: ipa must start and end with '/'`);
      }
  }

if (errors.length) {
  console.error("content:validate-exercises FAILED:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}
console.log(
  `content:validate-exercises OK: ${extras.length} lesson extras, ${sets.length} sentence sets x ${sets[0]?.items?.length ?? 0} items.`,
);
