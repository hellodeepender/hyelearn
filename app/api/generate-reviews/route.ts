import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateLessonContent } from "@/lib/lesson-templates";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sk) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }
  const db = createClient(url, sk, { auth: { persistSession: false, autoRefreshToken: false } });

  // Step 1: Get ALL lesson IDs that already have exercises
  const { data: lessonsWithExercises } = await db
    .from("curated_exercises")
    .select("lesson_id");
  const filledSet = new Set((lessonsWithExercises ?? []).map((r) => r.lesson_id).filter(Boolean));

  // Step 2: Get all review/quiz lessons
  const { data: allLessons, error: queryErr } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, unit_id")
    .in("template_type", ["review", "quiz"])
    .eq("is_active", true);

  if (queryErr) {
    return NextResponse.json({ error: "Query failed", details: queryErr.message }, { status: 500 });
  }

  const empty = (allLessons ?? []).filter((l) => !filledSet.has(l.id));

  console.log("[generate-reviews] Total review/quiz:", allLessons?.length);
  console.log("[generate-reviews] Already filled:", (allLessons ?? []).filter((l) => filledSet.has(l.id)).length);
  console.log("[generate-reviews] Empty:", empty.length);

  const generated: { lessonId: string; title: string; type: string; count: number }[] = [];
  const skipped: { lessonId: string; title: string; reason: string }[] = [];
  const failed: { lessonId: string; title: string; error: string }[] = [];

  for (const lesson of empty) {
    try {
      // Get practice lesson IDs in same unit (vocabulary + alphabet only)
      const { data: allUnitLessons } = await db
        .from("curriculum_lessons")
        .select("id, template_type")
        .eq("unit_id", lesson.unit_id)
        .eq("is_active", true);
      const practiceIds = (allUnitLessons ?? [])
        .filter((l) => l.template_type === "vocabulary" || l.template_type === "alphabet")
        .map((l) => l.id);

      if (practiceIds.length === 0) {
        console.log(`[generate-reviews] Skipping ${lesson.title}: no practice lessons in unit`);
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: "no practice lessons in unit" });
        continue;
      }

      // Get content items from those practice lessons
      const { data: contentItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .in("lesson_id", practiceIds)
        .order("sort_order");

      if (!contentItems || contentItems.length < 3) {
        console.log(`[generate-reviews] Skipping ${lesson.title}: only ${contentItems?.length ?? 0} content items`);
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: `only ${contentItems?.length ?? 0} content items` });
        continue;
      }

      console.log(`[generate-reviews] Generating ${lesson.template_type} for "${lesson.title}" with ${contentItems.length} items`);

      // Generate exercises using template engine
      const exercises = generateLessonContent(lesson.template_type, contentItems);

      if (exercises.length === 0) {
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: "template engine returned 0 exercises" });
        continue;
      }

      // Clear any stale data and insert
      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);
      const { error: insertErr } = await db.from("curated_exercises").insert(
        exercises.map((ex) => ({
          lesson_id: lesson.id,
          exercise_type: ex.exercise_type,
          exercise_data: ex.exercise_data,
          sort_order: ex.sort_order,
          status: "approved",
        }))
      );

      if (insertErr) {
        console.error(`[generate-reviews] Insert failed for ${lesson.title}:`, insertErr.message);
        failed.push({ lessonId: lesson.id, title: lesson.title, error: insertErr.message });
        continue;
      }

      console.log(`[generate-reviews] ${lesson.title}: inserted ${exercises.length} exercises`);
      generated.push({ lessonId: lesson.id, title: lesson.title, type: lesson.template_type, count: exercises.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[generate-reviews] Failed for ${lesson.title}:`, msg);
      failed.push({ lessonId: lesson.id, title: lesson.title, error: msg });
    }
  }

  return NextResponse.json({
    totalReviewQuiz: allLessons?.length ?? 0,
    alreadyFilled: (allLessons ?? []).filter((l) => filledSet.has(l.id)).length,
    empty: empty.length,
    generated,
    skipped,
    failed,
  });
}
