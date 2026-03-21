import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { processLessonRewards } from "@/lib/xp";
import { getDomainConfig } from "@/config/domains";

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

  if (!lesson_id) {
    return NextResponse.json({ error: "lesson_id required" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : authClient;

  // Get locale from the lesson for the progress record
  const hostname = request.headers.get("host") || "hyelearn.com";
  const { locale: reqLocale } = getDomainConfig(hostname);

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

  // Check for existing progress
  const { data: existing } = await db
    .from("student_progress")
    .select("id, score, total, passed, attempts")
    .eq("student_id", user.id)
    .eq("lesson_id", lesson_id)
    .maybeSingle();

  let data: { id: string; passed: boolean; attempts: number } | null = null;

  if (existing) {
    // Update: keep best score, increment attempts, set passed if newly passing
    const bestScore = score > (existing.score ?? 0) ? score : existing.score;
    const bestTotal = score > (existing.score ?? 0) ? total : existing.total;
    const nowPassed = existing.passed || passed;
    const { data: updated, error: updateErr } = await db
      .from("student_progress")
      .update({
        score: bestScore,
        total: bestTotal,
        passed: nowPassed,
        attempts: (existing.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id, passed, attempts")
      .single();
    if (updateErr) {
      console.error("[progress] Update error:", updateErr.message, updateErr.details);
      return NextResponse.json({ error: updateErr.message, details: updateErr.details }, { status: 500 });
    }
    data = updated;
  } else {
    // Insert new progress
    const insertRow: Record<string, unknown> = {
      student_id: user.id,
      lesson_id,
      score,
      total,
      passed,
      attempts: 1,
      completed_at: new Date().toISOString(),
    };
    // Add locale if the column exists (added via migration)
    insertRow.locale = reqLocale;

    const { data: inserted, error: insertErr } = await db
      .from("student_progress")
      .insert(insertRow)
      .select("id, passed, attempts")
      .single();
    if (insertErr) {
      console.error("[progress] Insert error:", insertErr.message, insertErr.details, insertErr.hint);
      // If locale column doesn't exist, retry without it
      if (insertErr.message?.includes("locale")) {
        delete insertRow.locale;
        const { data: retry, error: retryErr } = await db
          .from("student_progress")
          .insert(insertRow)
          .select("id, passed, attempts")
          .single();
        if (retryErr) {
          console.error("[progress] Retry insert error:", retryErr.message);
          return NextResponse.json({ error: retryErr.message, details: retryErr.details }, { status: 500 });
        }
        data = retry;
      } else {
        return NextResponse.json({ error: insertErr.message, details: insertErr.details }, { status: 500 });
      }
    } else {
      data = inserted;
    }
  }

  if (!data) {
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }

  // Process rewards (XP + badges) — best-effort, don't block the response
  let rewards = { xpEarned: 0, newBadges: [] as string[], newTotal: 0, leveledUp: false };
  try {
    rewards = await processLessonRewards(
      db, user.id, lesson_id, templateType, data.passed, pct, clientStreak ?? 0, reqLocale,
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
