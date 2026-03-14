import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { lesson_id: string; score: number; total: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { lesson_id, score, total } = body;

  // Get passing score for this lesson
  const { data: lesson } = await supabase
    .from("curriculum_lessons")
    .select("passing_score")
    .eq("id", lesson_id)
    .single();

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= (lesson?.passing_score ?? 70);

  // Upsert progress — keep best score
  const { data: existing } = await supabase
    .from("student_progress")
    .select("id, score, total, passed, attempts")
    .eq("student_id", user.id)
    .eq("lesson_id", lesson_id)
    .single();

  if (existing) {
    const keepOld = existing.total > 0 && (existing.score / existing.total) > (score / total);
    const { error } = await supabase
      .from("student_progress")
      .update({
        score: keepOld ? existing.score : score,
        total: keepOld ? existing.total : total,
        passed: existing.passed || passed,
        attempts: existing.attempts + 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await supabase.from("student_progress").insert({
      student_id: user.id,
      lesson_id,
      score,
      total,
      passed,
      attempts: 1,
      completed_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ passed, pct });
}
