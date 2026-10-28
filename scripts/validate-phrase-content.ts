import content from "../data/phrases-500.json";
import { buildPhraseId } from "../src/lib/content";

const normalize = (value: string) => value.toLocaleLowerCase("en-US").trim().replace(/\s+/g, " ");
const issues: string[] = [];
const seen = new Set<string>();
const seenIds = new Set<string>();
const topics = new Set<string>();
const perTopic = new Map<string, number>();

for (const [index, item] of content.entries()) {
  const row = index + 1;
  topics.add(item.topicSlug);
  // Stable static IDs (src/lib/content.ts) must be unique for all 500:
  // Neon stores these slugs as plain text in progress/review rows.
  const stableId = buildPhraseId(item as Parameters<typeof buildPhraseId>[0]);
  if (seenIds.has(stableId)) issues.push(`Row ${row}: duplicate stable ID: ${stableId}`);
  seenIds.add(stableId);
  perTopic.set(item.topicSlug, (perTopic.get(item.topicSlug) ?? 0) + 1);
  if (!item.phrase.trim()) issues.push(`Row ${row}: phrase is empty`);
  if (!item.meaningVi.trim()) issues.push(`Row ${row}: Vietnamese meaning is empty`);
  if (!item.exampleEn.trim()) issues.push(`Row ${row}: English example is empty`);
  if (!item.exampleVi.trim()) issues.push(`Row ${row}: Vietnamese example is empty`);
  if (item.phrase.length > 300) issues.push(`Row ${row}: phrase exceeds 300 characters`);
  if (item.meaningVi.length < 2) issues.push(`Row ${row}: Vietnamese meaning looks too short`);
  const key = normalize(item.phrase);
  if (seen.has(key)) issues.push(`Row ${row}: duplicate phrase: ${item.phrase}`);
  seen.add(key);
}

if (content.length !== 500) issues.push(`Expected exactly 500 phrases, found ${content.length}`);
if (seenIds.size !== 500) issues.push(`Expected 500 unique stable IDs, found ${seenIds.size}`);
if (topics.size !== 23) issues.push(`Expected 23 topics, found ${topics.size}`);
for (const [slug, count] of perTopic) {
  if (count < 20 || count > 25) issues.push(`Topic ${slug} has ${count} phrases; expected 20–25`);
}

if (issues.length) {
  console.error(`Phrase content validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`Phrase content valid: ${content.length} phrases across ${topics.size} topics, ${seenIds.size} unique stable IDs.`);
for (const [slug, count] of perTopic) console.log(`- ${slug}: ${count}`);
