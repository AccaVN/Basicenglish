import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  date,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// NOTE (static-content refactor): phrase/topic/lesson CONTENT is not stored
// in Neon at all. It lives only in data/phrases-500.json, bundled with the
// app on Vercel and read via src/lib/content.ts. The tables below therefore
// keep only user data. userPhraseProgress.phraseId / reviewLogs.phraseId are
// the stable string IDs from src/lib/content.ts (e.g.
// "greetings-introductions/basic-greetings/001") — plain text, deliberately
// with NO foreign key to any content table, so a phrase can be edited in
// JSON and redeployed without touching the database.

export const userPhraseProgress = pgTable("user_phrase_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phraseId: varchar("phrase_id", { length: 200 }).notNull(),
  repetitions: integer("repetitions").notNull().default(0),
  intervalDays: integer("interval_days").notNull().default(0),
  easeFactor: integer("ease_factor").notNull().default(250),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true }).notNull().defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
  lastRating: varchar("last_rating", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("user_phrase_progress_unique").on(table.userId, table.phraseId),
  index("user_phrase_due_idx").on(table.userId, table.nextReviewAt),
]);

export const reviewLogs = pgTable("review_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phraseId: varchar("phrase_id", { length: 200 }).notNull(),
  rating: varchar("rating", { length: 20 }).notNull(),
  responseKey: varchar("response_key", { length: 100 }).notNull(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("review_logs_user_response_unique").on(table.userId, table.responseKey),
  index("review_logs_user_date_idx").on(table.userId, table.reviewedAt),
]);

export const xpEvents = pgTable("xp_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 40 }).notNull(),
  sourceId: varchar("source_id", { length: 100 }).notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("xp_events_user_source_unique").on(table.userId, table.eventType, table.sourceId),
  index("xp_events_user_created_idx").on(table.userId, table.createdAt),
]);

export const dailyActivity = pgTable("daily_activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  activityDate: date("activity_date").notNull(),
  reviewsCompleted: integer("reviews_completed").notNull().default(0),
  speakingMinutes: integer("speaking_minutes").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
}, (table) => [uniqueIndex("daily_activity_user_date_unique").on(table.userId, table.activityDate)]);

export const userRoles = pgTable("user_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("user_roles_user_role_unique").on(table.userId, table.role)]);

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: text("actor_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: varchar("action", { length: 60 }).notNull(),
  entityType: varchar("entity_type", { length: 60 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const speakingSessions = pgTable("speaking_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mode: varchar("mode", { length: 30 }).notNull().default("shadowing"),
  status: varchar("status", { length: 30 }).notNull().default("created"),
  scenarioTitle: varchar("scenario_title", { length: 200 }),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  summary: text("summary"),
});

export const speakingTurns = pgTable("speaking_turns", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").notNull().references(() => speakingSessions.id, { onDelete: "cascade" }),
  turnIndex: integer("turn_index").notNull(),
  targetText: text("target_text"),
  transcript: text("transcript"),
  feedback: jsonb("feedback").$type<{
    pronunciation?: string;
    grammar?: string;
    vocabulary?: string;
    correctedSentence?: string;
    retryPrompt?: string;
  }>(),
  audioDurationMs: integer("audio_duration_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("speaking_turn_session_index_unique").on(table.sessionId, table.turnIndex)]);
