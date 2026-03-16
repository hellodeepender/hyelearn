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

  // Get all alphabet lessons
  const { data: alphabetLessons, error: queryErr } = await db
    .from("curriculum_lessons")
    .select("id, title, unit_id")
    .eq("template_type", "alphabet")
    .eq("is_active", true);

  if (queryErr) {
    return NextResponse.json({ error: "Query failed", details: queryErr.message }, { status: 500 });
  }

  const lessons = alphabetLessons ?? [];
  if (lessons.length === 0) {
    return NextResponse.json({ message: "No alphabet lessons found", regenerated: 0 });
  }

  // Delete all existing exercises for alphabet lessons
  const ids = lessons.map((l) => l.id);
  const { error: delErr } = await db
    .from("curated_exercises")
    .delete()
    .in("lesson_id", ids);

  if (delErr) {
    return NextResponse.json({ error: "Delete failed", details: delErr.message }, { status: 500 });
  }

  const regenerated: { lessonId: string; title: string; count: number }[] = [];
  const failed: { lessonId: string; title: string; error: string }[] = [];

  for (const lesson of lessons) {
    try {
      const { data: contentItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .eq("lesson_id", lesson.id)
        .order("sort_order");

      if (!contentItems || contentItems.length < 2) {
        failed.push({ lessonId: lesson.id, title: lesson.title, error: `only ${contentItems?.length ?? 0} content items` });
        continue;
      }

      const exercises = generateLessonContent("alphabet", contentItems);

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
        failed.push({ lessonId: lesson.id, title: lesson.title, error: insertErr.message });
        continue;
      }

      regenerated.push({ lessonId: lesson.id, title: lesson.title, count: exercises.length });
    } catch (err) {
      failed.push({ lessonId: lesson.id, title: lesson.title, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    totalAlphabetLessons: lessons.length,
    regenerated: regenerated.length,
    failed: failed.length,
    details: regenerated,
    errors: failed,
  });
}
