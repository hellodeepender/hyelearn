import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { processLessonRewards } from "@/lib/xp";

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !sk) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }
  const db = createClient(url, sk, { auth: { persistSession: false, autoRefreshToken: false } });

  // Get all student progress with lesson type
  const { data: allProgress, error: pErr } = await db
    .from("student_progress")
    .select("student_id, lesson_id, passed, score, total, curriculum_lessons!inner(lesson_type)")
    .not("score", "is", null);

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  // Group by student
  const byStudent = new Map<string, typeof allProgress>();
  for (const row of allProgress ?? []) {
    const arr = byStudent.get(row.student_id) ?? [];
    arr.push(row);
    byStudent.set(row.student_id, arr);
  }

  const results: { studentId: string; xpAwarded: number; badges: string[] }[] = [];

  for (const [studentId, rows] of byStudent) {
    let totalAwarded = 0;

    for (const row of rows) {
      const lessonType = (row.curriculum_lessons as unknown as { lesson_type: string }).lesson_type ?? "lesson";
      const pct = row.total > 0 ? Math.round((row.score / row.total) * 100) : 0;

      // Use processLessonRewards which is idempotent (checks for existing xp rows)
      const rewards = await processLessonRewards(
        db, studentId, row.lesson_id, lessonType, row.passed, pct, 0,
      );
      totalAwarded += rewards.xpEarned;
    }

    // Recalculate total_xp from actual xp rows to ensure consistency
    const { data: xpRows } = await db
      .from("student_xp")
      .select("xp_amount")
      .eq("student_id", studentId);
    const correctTotal = (xpRows ?? []).reduce((sum, r) => sum + r.xp_amount, 0);
    await db.from("profiles").update({ total_xp: correctTotal }).eq("id", studentId);

    // Check badges one final time
    const rewards = await processLessonRewards(db, studentId, rows[0].lesson_id, "lesson", true, 100, 0);

    results.push({ studentId, xpAwarded: totalAwarded, badges: rewards.newBadges });
  }

  return NextResponse.json({
    studentsProcessed: results.length,
    results,
  });
}
