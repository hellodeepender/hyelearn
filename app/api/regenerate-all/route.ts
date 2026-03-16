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

  const practice = { regenerated: 0, failed: 0, details: [] as { lesson: string; type: string; count: number }[], errors: [] as { lesson: string; error: string }[] };
  const reviewQuiz = { regenerated: 0, failed: 0, details: [] as { lesson: string; type: string; count: number }[], errors: [] as { lesson: string; error: string }[] };

  // --- PASS 1: Vocabulary + Alphabet lessons that have content_items ---
  const { data: practiceLessons, error: pErr } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, unit_id")
    .in("template_type", ["vocabulary", "alphabet"])
    .eq("is_active", true);

  if (pErr) {
    return NextResponse.json({ error: "Query failed", details: pErr.message }, { status: 500 });
  }

  for (const lesson of practiceLessons ?? []) {
    try {
      const { data: contentItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .eq("lesson_id", lesson.id)
        .order("sort_order");

      if (!contentItems || contentItems.length < 2) continue; // skip lessons with no content

      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

      const exercises = generateLessonContent(lesson.template_type, contentItems);

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
        practice.errors.push({ lesson: lesson.title, error: insertErr.message });
        practice.failed++;
        continue;
      }

      practice.details.push({ lesson: lesson.title, type: lesson.template_type, count: exercises.length });
      practice.regenerated++;
    } catch (err) {
      practice.errors.push({ lesson: lesson.title, error: err instanceof Error ? err.message : String(err) });
      practice.failed++;
    }
  }

  // --- PASS 2: Review + Quiz lessons ---
  const { data: rqLessons, error: rqErr } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, unit_id")
    .in("template_type", ["review", "quiz"])
    .eq("is_active", true);

  if (rqErr) {
    return NextResponse.json({ error: "Review/quiz query failed", details: rqErr.message, practice }, { status: 500 });
  }

  for (const lesson of rqLessons ?? []) {
    try {
      // Get practice lesson IDs in same unit
      const { data: unitLessons } = await db
        .from("curriculum_lessons")
        .select("id, template_type")
        .eq("unit_id", lesson.unit_id)
        .eq("is_active", true);
      const practiceIds = (unitLessons ?? [])
        .filter((l) => l.template_type === "vocabulary" || l.template_type === "alphabet")
        .map((l) => l.id);

      if (practiceIds.length === 0) continue;

      const { data: contentItems } = await db
        .from("content_items")
        .select("id, item_type, sort_order, item_data")
        .in("lesson_id", practiceIds)
        .order("sort_order");

      if (!contentItems || contentItems.length < 3) continue;

      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

      const exercises = generateLessonContent(lesson.template_type, contentItems);

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
        reviewQuiz.errors.push({ lesson: lesson.title, error: insertErr.message });
        reviewQuiz.failed++;
        continue;
      }

      reviewQuiz.details.push({ lesson: lesson.title, type: lesson.template_type, count: exercises.length });
      reviewQuiz.regenerated++;
    } catch (err) {
      reviewQuiz.errors.push({ lesson: lesson.title, error: err instanceof Error ? err.message : String(err) });
      reviewQuiz.failed++;
    }
  }

  return NextResponse.json({
    practice: { regenerated: practice.regenerated, failed: practice.failed, details: practice.details, errors: practice.errors },
    reviewQuiz: { regenerated: reviewQuiz.regenerated, failed: reviewQuiz.failed, details: reviewQuiz.details, errors: reviewQuiz.errors },
    total: practice.regenerated + reviewQuiz.regenerated,
  });
}
