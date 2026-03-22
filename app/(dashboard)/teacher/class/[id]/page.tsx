import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import ClassDetailClient from "./ClassDetailClient";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use service role client for RLS-sensitive queries (auth.uid() can be null in server components)
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = sk ? createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } }) : supabase;

  const { data: profile } = await db.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  const { data: cls } = await db
    .from("classes")
    .select("id, name, grade_level, join_code, max_students")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();
  if (!cls) notFound();

  // Get class members
  const { data: members } = await db
    .from("class_memberships")
    .select("student_id, joined_at, status, profiles!class_memberships_student_id_fkey(full_name)")
    .eq("class_id", id)
    .eq("status", "active")
    .order("joined_at");

  const studentIds = (members ?? []).map((m) => m.student_id);

  // Get all progress for class students
  const { data: progress } = studentIds.length > 0
    ? await db
        .from("student_progress")
        .select("student_id, lesson_id, score, total, passed, completed_at")
        .in("student_id", studentIds)
    : { data: [] };

  // Count total available lessons for the grade
  const gradeValue = cls.grade_level === 0 ? "K" : String(cls.grade_level);
  const { data: gradeLevel } = await db.from("curriculum_levels").select("id").eq("grade_value", gradeValue).single();
  let totalLessons = 0;
  if (gradeLevel) {
    const { data: units } = await db.from("curriculum_units").select("id").eq("level_id", gradeLevel.id).eq("is_active", true);
    if (units) {
      const { count } = await db
        .from("curriculum_lessons")
        .select("id", { count: "exact", head: true })
        .in("unit_id", units.map((u) => u.id))
        .eq("is_active", true);
      totalLessons = count ?? 0;
    }
  }

  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const dayAgo = now - 86400000;

  const roster = (members ?? []).map((m) => {
    const sp = (progress ?? []).filter((p) => p.student_id === m.student_id);
    const passed = sp.filter((p) => p.passed);
    const lessonsDone = passed.length;
    const scores = sp.filter((p) => p.score != null && p.total != null && p.total > 0);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((s, p) => s + (p.score / p.total) * 100, 0) / scores.length)
      : null;
    const lastActiveTs = sp.length > 0
      ? Math.max(...sp.map((p) => p.completed_at ? new Date(p.completed_at).getTime() : 0))
      : null;
    const lastActive = lastActiveTs && lastActiveTs > 0 ? new Date(lastActiveTs).toISOString() : null;
    const activityStatus = lastActiveTs
      ? lastActiveTs >= dayAgo ? "active" : lastActiveTs >= weekAgo ? "recent" : "inactive"
      : "inactive";

    return {
      id: m.student_id,
      name: (m.profiles as unknown as { full_name: string })?.full_name ?? "Student",
      joinedAt: m.joined_at,
      lessonsDone,
      totalLessons,
      avgScore,
      lastActive,
      activityStatus,
    };
  }).sort((a, b) => {
    // Sort: active first, then recent, then inactive
    const order = { active: 0, recent: 1, inactive: 2 };
    return (order[a.activityStatus as keyof typeof order] ?? 2) - (order[b.activityStatus as keyof typeof order] ?? 2);
  });

  // Aggregate stats
  const totalStudents = roster.length;
  const allScores = (progress ?? []).filter((p) => p.score != null && p.total != null && p.total > 0);
  const classAvgScore = allScores.length > 0
    ? Math.round(allScores.reduce((s, p) => s + (p.score / p.total) * 100, 0) / allScores.length)
    : 0;
  const totalLessonsDone = roster.reduce((s, r) => s + r.lessonsDone, 0);
  const activeThisWeek = roster.filter((r) => r.activityStatus === "active" || r.activityStatus === "recent").length;

  const gradeLabel = cls.grade_level === 0 ? "Kindergarten" : `Grade ${cls.grade_level}`;

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <ClassDetailClient
        classId={cls.id}
        className={cls.name}
        gradeLabel={gradeLabel}
        joinCode={cls.join_code}
        roster={roster}
        stats={{ totalStudents, classAvgScore, totalLessonsDone, activeThisWeek }}
      />
    </div>
  );
}
