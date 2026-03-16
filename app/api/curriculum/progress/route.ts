import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { processLessonRewards } from "@/lib/xp";

export async function POST(request: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message }, { status: 401 });
  }

  let body: { lesson_id: string; score: number; total: number; streak?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lesson_id, score, total, streak: clientStreak } = body;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : authClient;

  // Look up lesson
  const { data: lesson, error: lessonErr } = await db
    .from("curriculum_lessons")
    .select("passing_score, lesson_type, template_type")
    .eq("id", lesson_id)
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: "Lesson not found", details: lessonErr?.message }, { status: 404 });
  }

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  // template_type is reliable: 'review', 'quiz', 'vocabulary', 'alphabet'
  const templateType = lesson.template_type ?? lesson.lesson_type;
  const passed = templateType === "review" ? true : pct >= (lesson.passing_score ?? 70);

  // Upsert progress
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
      { onConflict: "student_id,lesson_id" },
    )
    .select("id, passed, attempts")
    .single();

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message, details: upsertErr.details }, { status: 500 });
  }

  // Process rewards (XP + badges) — best-effort, don't block the response
  let rewards = { xpEarned: 0, newBadges: [] as string[], newTotal: 0, leveledUp: false };
  try {
    rewards = await processLessonRewards(
      db, user.id, lesson_id, templateType, data.passed, pct, clientStreak ?? 0,
    );
  } catch (err) {
    console.error("[progress] Rewards error:", err);
  }

  return NextResponse.json({
    passed: data.passed,
    pct,
    xpEarned: rewards.xpEarned,
    newBadges: rewards.newBadges,
    newTotal: rewards.newTotal,
    leveledUp: rewards.leveledUp,
  });
}
