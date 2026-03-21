/**
 * Seed exercises for all Greek (el) lessons that have content_items but no exercises.
 * Also generates exercises for review/quiz lessons.
 *
 * Usage: npx tsx scripts/seed-greek-exercises.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing env vars"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SEED_KEY = process.env.SEED_API_KEY!;
if (!SEED_KEY) { console.error("Missing SEED_API_KEY"); process.exit(1); }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callGenerateLesson(lessonId: string): Promise<{ count: number } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/generate-lesson`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, key: SEED_KEY }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as Record<string, string>).error ?? `${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`    [ERROR] ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function main() {
  console.log("\n\uD83C\uDDEC\uD83C\uDDF7 Greek Exercise Seeder\n");

  // Step 1: Find all Greek lessons
  const { data: allLessons } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, sort_order, unit_id, curriculum_units!inner(title, sort_order, curriculum_levels!inner(title, sort_order, locale))")
    .eq("is_active", true)
    .order("sort_order");

  type LessonRow = typeof allLessons extends (infer T)[] | null ? T : never;
  type TypedLesson = LessonRow & {
    curriculum_units: { title: string; sort_order: number; curriculum_levels: { title: string; sort_order: number; locale: string } };
  };

  const greekLessons = ((allLessons ?? []) as unknown as TypedLesson[])
    .filter((l) => l.curriculum_units.curriculum_levels.locale === "el")
    .sort((a, b) => {
      const aL = a.curriculum_units.curriculum_levels.sort_order;
      const bL = b.curriculum_units.curriculum_levels.sort_order;
      if (aL !== bL) return aL - bL;
      if (a.curriculum_units.sort_order !== b.curriculum_units.sort_order)
        return a.curriculum_units.sort_order - b.curriculum_units.sort_order;
      return a.sort_order - b.sort_order;
    });

  console.log(`Found ${greekLessons.length} Greek lessons\n`);

  // Step 2: Find which lessons already have exercises
  const { data: existingExercises } = await db
    .from("curated_exercises")
    .select("lesson_id")
    .limit(50000);
  const filledIds = new Set((existingExercises ?? []).map((r) => r.lesson_id));

  // Step 3: Find which lessons have content_items
  const { data: contentItems } = await db
    .from("content_items")
    .select("lesson_id")
    .limit(50000);
  const hasContentIds = new Set((contentItems ?? []).map((r) => r.lesson_id));

  // Categorize
  const needExercises = greekLessons.filter((l) => !filledIds.has(l.id) && hasContentIds.has(l.id));
  const reviewQuiz = greekLessons.filter((l) => !filledIds.has(l.id) && (l.template_type === "review" || l.template_type === "quiz"));
  const noContent = greekLessons.filter((l) => !filledIds.has(l.id) && !hasContentIds.has(l.id) && l.template_type !== "review" && l.template_type !== "quiz");

  console.log(`Lessons with content but no exercises: ${needExercises.length}`);
  console.log(`Review/Quiz lessons needing exercises: ${reviewQuiz.length}`);
  console.log(`Lessons with no content at all: ${noContent.length}`);
  console.log(`Lessons already with exercises: ${greekLessons.length - needExercises.length - reviewQuiz.length - noContent.length}\n`);

  let success = 0;
  let errors = 0;

  // Step 4: Generate exercises for lessons that have content_items
  console.log("=== Pass 1: Practice lessons with content ===\n");
  for (const lesson of needExercises) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    process.stdout.write(`  ${level.title} > ${unit.title} > ${lesson.title}... `);

    const result = await callGenerateLesson(lesson.id);
    if (result) {
      console.log(`${result.count ?? 0} exercises`);
      success++;
    } else {
      errors++;
    }
    await sleep(300);
  }

  // Step 5: Generate exercises for review/quiz lessons
  console.log("\n=== Pass 2: Review/Quiz lessons ===\n");
  for (const lesson of reviewQuiz) {
    const unit = lesson.curriculum_units;
    const level = unit.curriculum_levels;
    process.stdout.write(`  ${level.title} > ${unit.title} > ${lesson.title}... `);

    const result = await callGenerateLesson(lesson.id);
    if (result) {
      console.log(`${result.count ?? 0} exercises`);
      success++;
    } else {
      errors++;
    }
    await sleep(300);
  }

  // Step 6: Summary
  console.log("\n=== Summary ===\n");
  console.log(`Success: ${success}`);
  console.log(`Errors: ${errors}`);
  console.log(`No content (skipped): ${noContent.length}`);

  if (noContent.length > 0) {
    console.log("\nLessons with no content_items (need content first):");
    for (const l of noContent.slice(0, 10)) {
      console.log(`  ${l.curriculum_units.curriculum_levels.title} > ${l.curriculum_units.title} > ${l.title} [${l.template_type}]`);
    }
    if (noContent.length > 10) console.log(`  ... and ${noContent.length - 10} more`);
  }

  // Verify
  console.log("\n=== Verification ===\n");
  const { data: finalCount } = await db
    .from("curated_exercises")
    .select("lesson_id, curriculum_lessons!inner(locale)")
    .limit(50000);
  const elExercises = ((finalCount ?? []) as unknown as { lesson_id: string; curriculum_lessons: { locale: string } }[])
    .filter((r) => r.curriculum_lessons.locale === "el");
  const uniqueElLessons = new Set(elExercises.map((r) => r.lesson_id));
  console.log(`Total Greek exercises: ${elExercises.length}`);
  console.log(`Greek lessons with exercises: ${uniqueElLessons.size}/${greekLessons.length}`);

  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
