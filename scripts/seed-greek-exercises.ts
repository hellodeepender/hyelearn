/**
 * Seed exercises for all Greek (el) lessons directly using the template engine.
 * No dev server needed — imports generateLessonContent directly.
 *
 * Usage: npx tsx scripts/seed-greek-exercises.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Import the template engine directly
import { generateLessonContent } from "../lib/lesson-templates";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing env vars"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  console.log("\n\uD83C\uDDEC\uD83C\uDDF7 Greek Exercise Seeder (direct template engine)\n");

  // Step 1: Find all Greek lessons with their template type and unit info
  const { data: allLessons } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, sort_order, unit_id, curriculum_units!inner(title, sort_order, curriculum_levels!inner(title, sort_order, locale))")
    .eq("is_active", true)
    .order("sort_order");

  type TypedLesson = {
    id: string; title: string; template_type: string; sort_order: number; unit_id: string;
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

  // Step 3: Process each lesson that needs exercises
  let success = 0;
  let errors = 0;
  let skipped = 0;

  // Pass 1: Practice lessons (alphabet, vocabulary)
  const practiceLessons = greekLessons.filter(
    (l) => !filledIds.has(l.id) && l.template_type !== "review" && l.template_type !== "quiz"
  );
  console.log(`=== Pass 1: ${practiceLessons.length} practice lessons ===\n`);

  for (const lesson of practiceLessons) {
    const label = `${lesson.curriculum_units.curriculum_levels.title} > ${lesson.curriculum_units.title} > ${lesson.title}`;

    // Fetch content_items for this lesson
    const { data: items } = await db
      .from("content_items")
      .select("id, item_type, sort_order, item_data")
      .eq("lesson_id", lesson.id)
      .order("sort_order");

    if (!items || items.length === 0) {
      console.log(`  \u23ED ${label}: no content_items, skipped`);
      skipped++;
      continue;
    }

    try {
      const generated = generateLessonContent(lesson.template_type, items, "el");

      if (generated.length === 0) {
        console.log(`  \u23ED ${label}: template returned 0 exercises, skipped`);
        skipped++;
        continue;
      }

      // Delete existing and insert new
      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);
      const { error: insertErr } = await db.from("curated_exercises").insert(
        generated.map((ex) => ({
          lesson_id: lesson.id,
          exercise_type: ex.exercise_type,
          exercise_data: ex.exercise_data,
          sort_order: ex.sort_order,
          status: "approved",
          created_by: null,
        }))
      );

      if (insertErr) {
        console.error(`  \u274C ${label}: ${insertErr.message}`);
        errors++;
      } else {
        console.log(`  \u2705 ${label}: ${generated.length} exercises`);
        success++;
        filledIds.add(lesson.id);
      }
    } catch (err) {
      console.error(`  \u274C ${label}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  // Pass 2: Review/Quiz lessons (aggregate content from practice lessons in the same unit)
  const reviewQuizLessons = greekLessons.filter(
    (l) => !filledIds.has(l.id) && (l.template_type === "review" || l.template_type === "quiz")
  );
  console.log(`\n=== Pass 2: ${reviewQuizLessons.length} review/quiz lessons ===\n`);

  for (const lesson of reviewQuizLessons) {
    const label = `${lesson.curriculum_units.curriculum_levels.title} > ${lesson.curriculum_units.title} > ${lesson.title}`;

    try {
      // Get all practice lessons in the same unit
      const { data: unitLessons } = await db
        .from("curriculum_lessons")
        .select("id, template_type")
        .eq("unit_id", lesson.unit_id)
        .eq("is_active", true)
        .not("template_type", "in", '("review","quiz")')
        .order("sort_order");

      const practiceIds = (unitLessons ?? []).map((l) => l.id);
      if (practiceIds.length === 0) {
        console.log(`  \u23ED ${label}: no practice lessons in unit, skipped`);
        skipped++;
        continue;
      }

      // Get content_items from all practice lessons
      const { data: unitItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .in("lesson_id", practiceIds)
        .order("sort_order");

      if (!unitItems || unitItems.length < 2) {
        console.log(`  \u23ED ${label}: not enough content (${unitItems?.length ?? 0} items), skipped`);
        skipped++;
        continue;
      }

      const generated = generateLessonContent(lesson.template_type, unitItems, "el");

      if (generated.length === 0) {
        console.log(`  \u23ED ${label}: template returned 0 exercises, skipped`);
        skipped++;
        continue;
      }

      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);
      const { error: insertErr } = await db.from("curated_exercises").insert(
        generated.map((ex) => ({
          lesson_id: lesson.id,
          exercise_type: ex.exercise_type,
          exercise_data: ex.exercise_data,
          sort_order: ex.sort_order,
          status: "approved",
          created_by: null,
        }))
      );

      if (insertErr) {
        console.error(`  \u274C ${label}: ${insertErr.message}`);
        errors++;
      } else {
        console.log(`  \u2705 ${label}: ${generated.length} exercises`);
        success++;
      }
    } catch (err) {
      console.error(`  \u274C ${label}: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  // Verification
  console.log("\n=== Verification ===\n");
  const { count: totalEl } = await db
    .from("curated_exercises")
    .select("id", { count: "exact", head: true });

  // Count Greek exercises by joining with lessons
  const { data: elCheck } = await db
    .from("curated_exercises")
    .select("lesson_id, curriculum_lessons!inner(locale)")
    .eq("curriculum_lessons.locale", "el")
    .limit(50000);

  const elLessonIds = new Set((elCheck ?? []).map((r) => r.lesson_id));

  console.log(`Total exercises in DB: ${totalEl ?? "?"}`);
  console.log(`Greek exercises: ${elCheck?.length ?? 0}`);
  console.log(`Greek lessons with exercises: ${elLessonIds.size}/${greekLessons.length}`);
  console.log(`\nSuccess: ${success}, Errors: ${errors}, Skipped: ${skipped}`);
  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
