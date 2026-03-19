import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { canAccessCurriculum } from "@/lib/access";
import { getLocale } from "@/lib/server-locale";
import Header from "@/components/ui/Header";
import Paywall from "@/components/ui/Paywall";
import LessonPractice from "./LessonPractice";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ levelSlug: string; unitSlug: string; lessonSlug: string }>;
}) {
  const { levelSlug, unitSlug, lessonSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, grade_level").eq("id", user.id).single();

  const { data: level } = await supabase.from("curriculum_levels").select("id, title, grade_value").eq("slug", levelSlug).single();
  if (!level) notFound();

  const { data: unit } = await supabase.from("curriculum_units").select("id, title").eq("level_id", level.id).eq("slug", unitSlug).single();
  if (!unit) notFound();

  const { data: lesson } = await supabase
    .from("curriculum_lessons")
    .select("id, slug, title, lesson_type, template_type, passing_score, sort_order")
    .eq("unit_id", unit.id)
    .eq("slug", lessonSlug)
    .single();
  if (!lesson) notFound();

  // Access control — free tier only gets lesson 1 of each unit
  const access = await canAccessCurriculum(supabase, user.id, lesson.sort_order);
  if (!access.allowed) {
    return (
      <div className="min-h-screen bg-cream">
        <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
        <Paywall type="curriculum" />
      </div>
    );
  }

  const { data: exercises } = await supabase
    .from("curated_exercises")
    .select("exercise_type, exercise_data, sort_order")
    .eq("lesson_id", lesson.id)
    .eq("status", "approved")
    .order("sort_order");

  const { data: nextLesson } = await supabase
    .from("curriculum_lessons")
    .select("slug, sort_order")
    .eq("unit_id", unit.id)
    .eq("is_active", true)
    .gt("sort_order", lesson.sort_order)
    .order("sort_order")
    .limit(1)
    .single();

  const locale = await getLocale();
  const backUrl = `/student/curriculum/${levelSlug}/${unitSlug}`;

  // Gate next lesson: check if student can access it
  let nextLessonUrl: string | undefined;
  if (nextLesson) {
    const nextAccess = await canAccessCurriculum(supabase, user.id, nextLesson.sort_order);
    nextLessonUrl = nextAccess.allowed
      ? `/student/curriculum/${levelSlug}/${unitSlug}/${nextLesson.slug}`
      : undefined;
  }

  // If no next lesson in this unit, find the next unit's first lesson
  let nextUnitUrl: string | undefined;
  if (!nextLesson) {
    const { data: currentUnit } = await supabase
      .from("curriculum_units")
      .select("sort_order")
      .eq("id", unit.id)
      .single();

    if (currentUnit) {
      const { data: nextUnit } = await supabase
        .from("curriculum_units")
        .select("slug")
        .eq("level_id", level.id)
        .eq("is_active", true)
        .eq("locale", locale)
        .gt("sort_order", currentUnit.sort_order)
        .order("sort_order")
        .limit(1)
        .single();

      if (nextUnit) {
        nextUnitUrl = `/student/curriculum/${levelSlug}/${nextUnit.slug}`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <LessonPractice
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        lessonType={lesson.template_type ?? lesson.lesson_type}
        passingScore={lesson.passing_score}
        exercises={(exercises ?? []).map((e) => ({ type: e.exercise_type, data: e.exercise_data }))}
        backUrl={backUrl}
        nextLessonUrl={nextLessonUrl}
        nextUnitUrl={nextUnitUrl}
        gradeValue={level.grade_value}
        locale={locale}
      />
    </div>
  );
}
