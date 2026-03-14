import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // Auth check — verify the user is logged in
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[curriculum/progress] Auth failed:", authError?.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id: string; score: number; total: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lesson_id, score, total } = body;
  console.log("[curriculum/progress] Saving for user:", user.id, { lesson_id, score, total });

  // Use admin client to bypass RLS
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[curriculum/progress] Admin client failed:", err);
    return NextResponse.json({ error: "Server configuration error", details: String(err) }, { status: 500 });
  }

  // Get passing score for this lesson
  const { data: lesson, error: lessonError } = await admin
    .from("curriculum_lessons")
    .select("passing_score")
    .eq("id", lesson_id)
    .single();

  if (lessonError) {
    console.error("[curriculum/progress] Lesson lookup failed:", lessonError.message);
    return NextResponse.json({ error: "Lesson not found", details: lessonError.message }, { status: 404 });
  }

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= (lesson.passing_score ?? 70);

  // Check for existing progress
  const { data: existing } = await admin
    .from("student_progress")
    .select("id, score, total, passed, attempts")
    .eq("student_id", user.id)
    .eq("lesson_id", lesson_id)
    .single();

  if (existing) {
    const keepOld = existing.total > 0 && (existing.score / existing.total) > (total > 0 ? score / total : 0);
    const { error: updateError } = await admin
      .from("student_progress")
      .update({
        score: keepOld ? existing.score : score,
        total: keepOld ? existing.total : total,
        passed: existing.passed || passed,
        attempts: existing.attempts + 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[curriculum/progress] Update error:", updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    console.log("[curriculum/progress] Updated existing progress:", existing.id);
  } else {
    const { data: inserted, error: insertError } = await admin
      .from("student_progress")
      .insert({
        student_id: user.id,
        lesson_id,
        score,
        total,
        passed,
        attempts: 1,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[curriculum/progress] Insert error:", insertError.message, insertError.details, insertError.hint);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    console.log("[curriculum/progress] Inserted new progress:", inserted.id);
  }

  // Verify the save actually worked
  const { data: verify } = await admin
    .from("student_progress")
    .select("id, passed")
    .eq("student_id", user.id)
    .eq("lesson_id", lesson_id)
    .single();

  if (!verify) {
    console.error("[curriculum/progress] Verification failed — row not found after save");
    return NextResponse.json({ error: "Save verification failed" }, { status: 500 });
  }

  console.log("[curriculum/progress] Verified save, passed:", verify.passed);
  return NextResponse.json({ passed: verify.passed, pct });
}
