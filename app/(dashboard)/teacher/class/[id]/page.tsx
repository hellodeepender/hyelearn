import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import ClassDetailClient from "./ClassDetailClient";

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, grade_level, join_code, max_students")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();
  if (!cls) notFound();

  // Get members
  const { data: members } = await supabase
    .from("class_memberships")
    .select("student_id, joined_at, status, profiles!class_memberships_student_id_fkey(full_name)")
    .eq("class_id", id)
    .eq("status", "active")
    .order("joined_at");

  // Get progress for each student
  const studentIds = (members ?? []).map((m) => m.student_id);
  const { data: progress } = studentIds.length > 0
    ? await supabase.from("student_progress").select("student_id, passed, completed_at").in("student_id", studentIds)
    : { data: [] };

  const roster = (members ?? []).map((m) => {
    const studentProgress = (progress ?? []).filter((p) => p.student_id === m.student_id);
    const lessonsDone = studentProgress.filter((p) => p.passed).length;
    const lastActive = studentProgress.length > 0
      ? studentProgress.sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))[0]?.completed_at
      : null;
    return {
      id: m.student_id,
      name: (m.profiles as unknown as { full_name: string })?.full_name ?? "Student",
      joinedAt: m.joined_at,
      lessonsDone,
      lastActive,
    };
  });

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
      />
    </div>
  );
}
