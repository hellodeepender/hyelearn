import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // 1. Auth: get the logged-in user
  const authClient = await createServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message }, { status: 401 });
  }

  // 2. Parse body
  let body: { lesson_id: string; score: number; total: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lesson_id, score, total } = body;
  console.log("[curriculum/progress] user:", user.id, "lesson:", lesson_id, "score:", score, "/", total);

  // 3. Build a Supabase client that can write.
  //    Prefer service role key (bypasses RLS). Fall back to the user's session client.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : authClient;

  // 4. Look up the lesson's passing score
  const { data: lesson, error: lessonErr } = await db
    .from("curriculum_lessons")
    .select("passing_score")
    .eq("id", lesson_id)
    .single();

  if (lessonErr || !lesson) {
    console.error("[curriculum/progress] Lesson lookup failed:", lessonErr);
    return NextResponse.json({ error: "Lesson not found", details: lessonErr?.message }, { status: 404 });
  }

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= (lesson.passing_score ?? 70);

  // 5. Upsert into student_progress
  const { data, error: upsertErr } = await db
    .from("student_progress")
    .upsert(
      {
        student_id: user.id,
        lesson_id,
        score,
        total,
        passed,
        attempts: 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" }
    )
    .select("id, passed, attempts")
    .single();

  if (upsertErr) {
    console.error("[curriculum/progress] Upsert error:", upsertErr.message, upsertErr.details, upsertErr.hint, upsertErr.code);
    return NextResponse.json({
      error: upsertErr.message,
      details: upsertErr.details,
      hint: upsertErr.hint,
      code: upsertErr.code,
    }, { status: 500 });
  }

  console.log("[progress] Save result:", { id: data.id, passed: data.passed, attempts: data.attempts, error: null });
  return NextResponse.json({ passed: data.passed, pct });
}
