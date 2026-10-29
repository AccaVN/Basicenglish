// Static phrase content — the ONLY source of phrase text, meanings and
// examples/dialogues in this project.
//
// IPA is reference-only and NOT expert-checked. Each phrase has exactly one
// usage illustration: either an example sentence (exampleEn/exampleVi/
// exampleIpa) or a short dialogue (2-3 turns, each with en/vi/ipa).
// The dialogue or example IPA is also reference-only.
//
// The 500 phrases live in data/phrases-500.json, which is bundled with the
// app when it is deployed on Vercel. They are NOT stored in Neon: Neon keeps
// only users/auth, SRS progress, review logs, XP, daily activity and
// speaking sessions. To change a phrase, edit the JSON (see
// docs/PHRASE_CONTENT_GUIDE.md), run `npm run content:validate`, commit and
// redeploy — there is no phrase seeding step and no phrases table.
//
// Stable IDs: `${topicSlug}/${lessonSlug}/${phraseSortOrder padded to 3}`.
// Example: "greetings-introductions/basic-greetings/001".
// phraseSortOrder is unique within each lesson in the JSON, and lessonSlug
// is unique across all topics, so these IDs are deterministic across
// deploys and unique for all 500 phrases. They are what Neon stores in
// user_phrase_progress.phrase_id / review_logs.phrase_id (as plain text,
// with no foreign key to any content table).

import rawPhrases from "../../data/phrases-500.json";

export type DialogueTurn = {
  speaker: string;
  en: string;
  vi: string;
  ipa: string;
};

export type RawPhrase = {
  topic: string;
  topicSlug: string;
  topicDescription: string;
  lesson: string;
  lessonSlug: string;
  phrase: string;
  meaningVi: string;
  ipa: string;
  usageType: "example" | "dialogue";
  exampleEn: string;
  exampleVi: string;
  exampleIpa: string;
  dialogue: DialogueTurn[];
  level: string;
  topicSortOrder: number;
  lessonSortOrder: number;
  phraseSortOrder: number;
};

export type StaticPhrase = RawPhrase & { id: string };

export type StaticLesson = {
  slug: string;
  title: string;
  description: string;
  level: string;
  sortOrder: number;
  topicSlug: string;
  topicName: string;
  phrases: StaticPhrase[];
  phraseCount: number;
};

export type StaticTopic = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  lessons: StaticLesson[];
  phraseCount: number;
};

export function buildPhraseId(item: RawPhrase): string {
  return `${item.topicSlug}/${item.lessonSlug}/${String(item.phraseSortOrder).padStart(3, "0")}`;
}

function buildContent() {
  const phrases: StaticPhrase[] = (rawPhrases as RawPhrase[])
    .map((item) => ({ ...item, id: buildPhraseId(item) }))
    .sort(
      (a, b) =>
        a.topicSortOrder - b.topicSortOrder ||
        a.lessonSortOrder - b.lessonSortOrder ||
        a.phraseSortOrder - b.phraseSortOrder ||
        a.phrase.localeCompare(b.phrase),
    );

  const lessonMap = new Map<string, StaticLesson>();
  const topicMap = new Map<string, StaticTopic>();

  for (const phrase of phrases) {
    let lesson = lessonMap.get(phrase.lessonSlug);
    if (!lesson) {
      lesson = {
        slug: phrase.lessonSlug,
        title: phrase.lesson,
        description: `Bài học tiếng Anh trình độ ${phrase.level} về ${phrase.topic.toLowerCase()}.`,
        level: phrase.level,
        sortOrder: phrase.lessonSortOrder,
        topicSlug: phrase.topicSlug,
        topicName: phrase.topic,
        phrases: [],
        phraseCount: 0,
      };
      lessonMap.set(phrase.lessonSlug, lesson);
    }
    lesson.phrases.push(phrase);
    lesson.phraseCount = lesson.phrases.length;

    let topic = topicMap.get(phrase.topicSlug);
    if (!topic) {
      topic = {
        slug: phrase.topicSlug,
        name: phrase.topic,
        description: phrase.topicDescription,
        sortOrder: phrase.topicSortOrder,
        lessons: [],
        phraseCount: 0,
      };
      topicMap.set(phrase.topicSlug, topic);
    }
    if (!topic.lessons.includes(lesson)) topic.lessons.push(lesson);
    topic.phraseCount = topic.lessons.reduce((sum, l) => sum + l.phraseCount, 0);
  }

  const topics = [...topicMap.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const topic of topics) topic.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
  const lessons = [...lessonMap.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title),
  );
  return { phrases, topics, lessons };
}

const content = buildContent();

export const PHRASES: StaticPhrase[] = content.phrases;
export const TOPICS: StaticTopic[] = content.topics;
export const LESSONS: StaticLesson[] = content.lessons;

const phraseById = new Map(PHRASES.map((p) => [p.id, p]));
const lessonBySlug = new Map(LESSONS.map((l) => [l.slug, l]));
const topicBySlug = new Map(TOPICS.map((t) => [t.slug, t]));

export function getPhraseById(id: string): StaticPhrase | undefined {
  return phraseById.get(id);
}

export function getLessonBySlug(slug: string): StaticLesson | undefined {
  return lessonBySlug.get(slug);
}

export function getTopicBySlug(slug: string): StaticTopic | undefined {
  return topicBySlug.get(slug);
}

export function getLessonPhrases(slug: string): StaticPhrase[] {
  return getLessonBySlug(slug)?.phrases ?? [];
}

export function getTopicPhrases(slug: string): StaticPhrase[] {
  const topic = getTopicBySlug(slug);
  if (!topic) return [];
  return topic.lessons.flatMap((lesson) => lesson.phrases);
}

/** Shape expected by PhraseStudy (audioUrl is always null: playback uses the browser's speech synthesis). */
export function phraseToStudy(phrase: StaticPhrase) {
  return {
    id: phrase.id,
    phrase: phrase.phrase,
    meaningVi: phrase.meaningVi,
    ipa: phrase.ipa,
    usageType: phrase.usageType,
    exampleEn: phrase.exampleEn,
    exampleVi: phrase.exampleVi,
    exampleIpa: phrase.exampleIpa,
    dialogue: phrase.dialogue,
    audioUrl: null as string | null,
  };
}
