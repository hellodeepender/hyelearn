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

  // ---- DIAGNOSTIC: Test a single insert/read cycle ----
  const testLessonId = "dffe71ef-44c1-44b1-b7f5-658154484ad8"; // First empty review lesson

  // 1. Check what's there now
  const { data: before, count: beforeCount } = await db
    .from("curated_exercises")
    .select("id, lesson_id, exercise_type", { count: "exact" })
    .eq("lesson_id", testLessonId);

  // 2. Delete existing
  const { error: delErr, count: delCount } = await db
    .from("curated_exercises")
    .delete({ count: "exact" })
    .eq("lesson_id", testLessonId);

  // 3. Get content for this lesson's unit
  const { data: lessonInfo } = await db
    .from("curriculum_lessons")
    .select("id, title, template_type, unit_id")
    .eq("id", testLessonId)
    .single();

  if (!lessonInfo) {
    return NextResponse.json({ error: "Test lesson not found" }, { status: 404 });
  }

  const { data: allUnitLessons } = await db
    .from("curriculum_lessons")
    .select("id, template_type")
    .eq("unit_id", lessonInfo.unit_id)
    .eq("is_active", true);
  const practiceIds = (allUnitLessons ?? [])
    .filter((l) => l.template_type === "vocabulary" || l.template_type === "alphabet")
    .map((l) => l.id);

  const { data: contentItems } = await db
    .from("content_items")
    .select("id, item_type, sort_order, item_data")
    .in("lesson_id", practiceIds)
    .order("sort_order");

  // 4. Generate exercises
  const exercises = generateLessonContent(lessonInfo.template_type, contentItems ?? []);

  // 5. Try inserting just ONE row first
  const singleRow = {
    lesson_id: testLessonId,
    exercise_type: exercises[0].exercise_type,
    exercise_data: exercises[0].exercise_data,
    sort_order: exercises[0].sort_order,
    status: "approved",
    created_by: null as string | null,
  };

  const { data: singleInsert, error: singleErr, count: singleCount, status: singleStatus, statusText: singleStatusText } = await db
    .from("curated_exercises")
    .insert(singleRow)
    .select("id, lesson_id");

  // 6. Check what's there after single insert
  const { data: afterSingle, count: afterSingleCount } = await db
    .from("curated_exercises")
    .select("id, lesson_id", { count: "exact" })
    .eq("lesson_id", testLessonId);

  // 7. Now try bulk insert of remaining
  const bulkRows = exercises.slice(1).map((ex) => ({
    lesson_id: testLessonId,
    exercise_type: ex.exercise_type,
    exercise_data: ex.exercise_data,
    sort_order: ex.sort_order,
    status: "approved",
    created_by: null as string | null,
  }));

  const { data: bulkInsert, error: bulkErr, status: bulkStatus, statusText: bulkStatusText } = await db
    .from("curated_exercises")
    .insert(bulkRows)
    .select("id");

  // 8. Final count
  const { count: finalCount } = await db
    .from("curated_exercises")
    .select("id", { count: "exact", head: true })
    .eq("lesson_id", testLessonId);

  return NextResponse.json({
    testLessonId,
    lessonInfo: { title: lessonInfo.title, type: lessonInfo.template_type },
    contentItemsFound: contentItems?.length ?? 0,
    exercisesGenerated: exercises.length,
    before: { rows: before?.length ?? 0, count: beforeCount },
    delete: { error: delErr?.message ?? null, count: delCount },
    singleInsert: {
      data: singleInsert,
      error: singleErr ? { message: singleErr.message, code: singleErr.code, details: singleErr.details, hint: singleErr.hint } : null,
      status: singleStatus,
      statusText: singleStatusText,
    },
    afterSingleInsert: { rows: afterSingle?.length ?? 0, count: afterSingleCount },
    bulkInsert: {
      rowsSent: bulkRows.length,
      dataReturned: bulkInsert?.length ?? 0,
      error: bulkErr ? { message: bulkErr.message, code: bulkErr.code, details: bulkErr.details, hint: bulkErr.hint } : null,
      status: bulkStatus,
      statusText: bulkStatusText,
    },
    finalCount,
  });
}
