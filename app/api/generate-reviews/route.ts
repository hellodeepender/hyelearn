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

  // Get all review/quiz lessons
  const { data: allLessons, error: queryErr } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, unit_id")
    .in("template_type", ["review", "quiz"])
    .eq("is_active", true);

  if (queryErr) {
    return NextResponse.json({ error: "Query failed", details: queryErr.message }, { status: 500 });
  }

  const generated: { lessonId: string; title: string; type: string; count: number }[] = [];
  const skipped: { lessonId: string; title: string; reason: string }[] = [];
  const failed: { lessonId: string; title: string; error: string }[] = [];
  let alreadyFilled = 0;

  for (const lesson of allLessons ?? []) {
    // Check THIS specific lesson for existing exercises
    const { count } = await db
      .from("curated_exercises")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", lesson.id);

    if ((count ?? 0) > 0) {
      alreadyFilled++;
      continue;
    }

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

      // Delete any stale/duplicate rows first, then insert fresh
      await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

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

      // Verify
      const { count: verifyCount } = await db
        .from("curated_exercises")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", lesson.id);

      if ((verifyCount ?? 0) === 0) {
        failed.push({ lessonId: lesson.id, title: lesson.title, error: `Insert reported success but verify found 0 rows` });
        continue;
      }

      generated.push({ lessonId: lesson.id, title: lesson.title, type: lesson.template_type, count: verifyCount ?? 0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failed.push({ lessonId: lesson.id, title: lesson.title, error: msg });
    }
  }

  return NextResponse.json({
    totalReviewQuiz: allLessons?.length ?? 0,
    alreadyFilled,
    generated,
    skipped,
    failed,
  });
}
