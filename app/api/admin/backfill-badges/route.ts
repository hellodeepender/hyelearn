import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { checkAndAwardBadges } from "@/lib/xp";

export async function POST(request: NextRequest) {
  // Admin only
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "No service key" }, { status: 500 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Get all students
  const { data: students } = await db
    .from("profiles")
    .select("id, total_xp, locale")
    .eq("role", "student");

  if (!students || students.length === 0) {
    return NextResponse.json({ message: "No students found", processed: 0 });
  }

  const results = [];

  for (const student of students) {
    // Use profile locale if set, otherwise infer from completed curriculum content
    let locale = student.locale;
    if (!locale) {
      const { data: progressWithLocale } = await db
        .from("student_progress")
        .select("curriculum_lessons!inner(locale)")
        .eq("student_id", student.id)
        .limit(1);
      locale = (progressWithLocale?.[0]?.curriculum_lessons as unknown as { locale: string })?.locale || "hy";
    }

    // Delete any wrongly-awarded badges and re-award fresh
    await db.from("student_badges").delete().eq("student_id", student.id);

    // Calculate streak for this student
    const { data: recentProgress } = await db
      .from("student_progress")
      .select("completed_at")
      .eq("student_id", student.id)
      .eq("passed", true)
      .not("score", "is", null)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(60);

    let streak = 0;
    if (recentProgress && recentProgress.length > 0) {
      const uniqueDays = [...new Set(recentProgress.map(p => p.completed_at?.split("T")[0]).filter(Boolean))].sort().reverse();
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDays.length; i++) {
          const diff = new Date(uniqueDays[i - 1]!).getTime() - new Date(uniqueDays[i]!).getTime();
          if (diff <= 86400000) streak++;
          else break;
        }
      }
    }

    // Re-award all badges with correct locale
    const newBadges = await checkAndAwardBadges(db, student.id, streak, locale);

    results.push({
      studentId: student.id,
      locale,
      xp: student.total_xp,
      streak,
      badgesAwarded: newBadges,
    });
  }

  return NextResponse.json({
    message: "Backfill complete",
    processed: results.length,
    results,
  });
}
