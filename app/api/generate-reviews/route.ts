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

  // Step 1: Get ALL lesson IDs that already have exercises (override default 1000-row limit)
  const { data: lessonsWithExercises } = await db
    .from("curated_exercises")
    .select("lesson_id")
    .limit(50000);
  const filledSet = new Set((lessonsWithExercises ?? []).map((r) => r.lesson_id).filter(Boolean));
  console.log(`[generate-reviews] exercises rows fetched: ${lessonsWithExercises?.length}, unique lesson_ids: ${filledSet.size}`);

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

  if (empty.length === 0) {
    return NextResponse.json({
      totalReviewQuiz: allLessons?.length ?? 0,
      alreadyFilled: (allLessons ?? []).filter((l) => filledSet.has(l.id)).length,
      empty: 0,
      generated: [],
      skipped: [],
      failed: [],
      message: "All review/quiz lessons already have exercises",
    });
  }

  const generated: { lessonId: string; title: string; type: string; count: number }[] = [];
  const skipped: { lessonId: string; title: string; reason: string }[] = [];
  const failed: { lessonId: string; title: string; error: string }[] = [];

  for (const lesson of empty) {
    try {
      const { data: allUnitLessons } = await db
        .from("curriculum_lessons")
        .select("id, template_type")
        .eq("unit_id", lesson.unit_id)
        .eq("is_active", true);
      const practiceIds = (allUnitLessons ?? [])
        .filter((l) => l.template_type === "vocabulary" || l.template_type === "alphabet")
        .map((l) => l.id);

      if (practiceIds.length === 0) {
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: "no practice lessons in unit" });
        continue;
      }

      const { data: contentItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .in("lesson_id", practiceIds)
        .order("sort_order");

      if (!contentItems || contentItems.length < 3) {
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: `only ${contentItems?.length ?? 0} content items` });
        continue;
      }

      const exercises = generateLessonContent(lesson.template_type, contentItems);

      if (exercises.length === 0) {
        skipped.push({ lessonId: lesson.id, title: lesson.title, reason: "template engine returned 0 exercises" });
        continue;
      }

      // Don't delete first — these are empty lessons
      const { error: insertErr } = await db
        .from("curated_exercises")
        .insert(exercises.map((ex) => ({
          lesson_id: lesson.id,
          exercise_type: ex.exercise_type,
          exercise_data: ex.exercise_data,
          sort_order: ex.sort_order,
          status: "approved",
          created_by: null as string | null,
        })));

      if (insertErr) {
        failed.push({ lessonId: lesson.id, title: lesson.title, error: `${insertErr.message} (${insertErr.code})` });
        continue;
      }

      generated.push({ lessonId: lesson.id, title: lesson.title, type: lesson.template_type, count: exercises.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
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
