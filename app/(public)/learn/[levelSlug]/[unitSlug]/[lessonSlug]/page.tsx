import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import PublicHeader from "@/components/ui/PublicHeader";
import LessonPractice from "@/app/(dashboard)/student/curriculum/[levelSlug]/[unitSlug]/[lessonSlug]/LessonPractice";

function getServiceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function generateMetadata({ params }: { params: Promise<{ levelSlug: string; unitSlug: string; lessonSlug: string }> }) {
  const { levelSlug, unitSlug, lessonSlug } = await params;
  const db = getServiceDb();

  const { data: level } = await db.from("curriculum_levels").select("id, title").eq("slug", levelSlug).single();
  if (!level) return { title: "Lesson" };

  const { data: unit } = await db.from("curriculum_units").select("id, title").eq("level_id", level.id).eq("slug", unitSlug).single();
  if (!unit) return { title: "Lesson" };

  const { data: lesson } = await db.from("curriculum_lessons").select("title").eq("unit_id", unit.id).eq("slug", lessonSlug).single();
  if (!lesson) return { title: "Lesson" };

  return {
    title: `${lesson.title} — ${unit.title} — ${level.title}`,
    description: `Interactive ${lesson.title} lesson. Part of our free K-5 heritage language curriculum.`,
  };
}

export default async function PublicLessonPage({
  params,
}: {
  params: Promise<{ levelSlug: string; unitSlug: string; lessonSlug: string }>;
}) {
  const { levelSlug, unitSlug, lessonSlug } = await params;
  const db = getServiceDb();

  const { data: level } = await db
    .from("curriculum_levels")
    .select("id, title, grade_value, locale")
    .eq("slug", levelSlug)
    .single();
  if (!level) notFound();

  const { data: unit } = await db
    .from("curriculum_units")
    .select("id, title, sort_order")
    .eq("level_id", level.id)
    .eq("slug", unitSlug)
    .single();
  if (!unit) notFound();

  const { data: lesson } = await db
    .from("curriculum_lessons")
    .select("id, slug, title, lesson_type, template_type, passing_score, sort_order")
    .eq("unit_id", unit.id)
    .eq("slug", lessonSlug)
    .single();
  if (!lesson) notFound();

  const { data: exercises } = await db
    .from("curated_exercises")
    .select("exercise_type, exercise_data, sort_order")
    .eq("lesson_id", lesson.id)
    .eq("status", "approved")
    .order("sort_order");

  // Find next lesson in same unit
  const { data: nextLesson } = await db
    .from("curriculum_lessons")
    .select("slug")
    .eq("unit_id", unit.id)
    .eq("is_active", true)
    .gt("sort_order", lesson.sort_order)
    .order("sort_order")
    .limit(1)
    .single();

  const backUrl = `/learn/${levelSlug}/${unitSlug}`;
  const nextLessonUrl = nextLesson
    ? `/learn/${levelSlug}/${unitSlug}/${nextLesson.slug}`
    : undefined;

  // Find next unit if no next lesson
  let nextUnitUrl: string | undefined;
  if (!nextLesson) {
    const { data: nextUnit } = await db
      .from("curriculum_units")
      .select("slug")
      .eq("level_id", level.id)
      .eq("is_active", true)
      .eq("locale", level.locale)
      .gt("sort_order", unit.sort_order)
      .order("sort_order")
      .limit(1)
      .single();
    if (nextUnit) nextUnitUrl = `/learn/${levelSlug}/${nextUnit.slug}`;
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <LessonPractice
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        lessonType={lesson.template_type ?? lesson.lesson_type}
        passingScore={lesson.passing_score ?? 70}
        exercises={(exercises ?? []).map((e) => ({ type: e.exercise_type, data: e.exercise_data }))}
        backUrl={backUrl}
        nextLessonUrl={nextLessonUrl}
        nextUnitUrl={nextUnitUrl}
        gradeValue={level.grade_value}
        locale={level.locale as string}
        isAnonymous={true}
      />
    </div>
  );
}
