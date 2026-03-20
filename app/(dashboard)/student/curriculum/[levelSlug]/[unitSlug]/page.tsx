import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getLessonsWithProgress } from "@/lib/curriculum";
import { getLocale } from "@/lib/server-locale";
import { getEnglishTitle } from "@/lib/grade-labels";

export default async function UnitPage({ params }: { params: Promise<{ levelSlug: string; unitSlug: string }> }) {
  const { levelSlug, unitSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();

  const { data: level } = await supabase.from("curriculum_levels").select("id, title").eq("slug", levelSlug).single();
  if (!level) notFound();

  const { data: unit } = await supabase
    .from("curriculum_units")
    .select("id, title, description")
    .eq("level_id", level.id)
    .eq("slug", unitSlug)
    .single();
  if (!unit) notFound();

  const locale = await getLocale();
  const lessons = await getLessonsWithProgress(supabase, user.id, unit.id, locale);

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <StudentNav />
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/student" },
          { label: "Curriculum", href: "/student/curriculum" },
          { label: level.title, href: `/student/curriculum/${levelSlug}` },
          { label: unit.title },
        ]} />
        <h1 className="text-2xl font-bold text-brown-800 mb-1">{unit.title}</h1>
        {unit.description && <p className="text-brown-500 text-sm mb-8">{unit.description}</p>}

        <div className="space-y-2">
          {lessons.map((lesson) => {
            const typeBadge = lesson.lesson_type === "quiz"
              ? "bg-amber-100 text-amber-700"
              : lesson.lesson_type === "final_test"
              ? "bg-purple-100 text-purple-700"
              : "bg-brown-100 text-brown-600";

            const statusIcon = lesson.passed
              ? "\u2713"
              : lesson.attempts > 0
              ? "\u{1F504}"
              : lesson.unlocked
              ? "\u25B6"
              : "\u{1F512}";

            const statusColor = lesson.passed
              ? "text-green-600 bg-green-50 border-green-200"
              : lesson.unlocked
              ? "text-gold bg-warm-white border-brown-100 hover:shadow-md hover:border-brown-200"
              : "text-brown-400 bg-brown-50 border-brown-100 opacity-60";

            const inner = (
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                  lesson.passed ? "bg-green-100 text-green-700" : lesson.unlocked ? "bg-gold/10 text-gold" : "bg-brown-100 text-brown-400"
                }`}>
                  {statusIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-brown-800">
                      {lesson.title}
                      {getEnglishTitle(lesson.title, locale) && <span className="text-xs text-brown-400 font-normal ml-2">({getEnglishTitle(lesson.title, locale)})</span>}
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${typeBadge}`}>
                      {lesson.lesson_type === "quiz" ? "Quiz" : lesson.lesson_type === "final_test" ? "Final" : "Practice"}
                    </span>
                  </div>
                  {lesson.description && <p className="text-xs text-brown-400 mt-0.5">{lesson.description}</p>}
                </div>
                {lesson.passed && lesson.score !== null && lesson.total !== null && (
                  <span className="text-sm font-medium text-green-600 shrink-0">
                    {Math.round((lesson.score / lesson.total) * 100)}%
                  </span>
                )}
                {!lesson.passed && lesson.attempts > 0 && lesson.score !== null && lesson.total !== null && (
                  <span className="text-sm text-brown-400 shrink-0">
                    {Math.round((lesson.score / lesson.total) * 100)}%
                  </span>
                )}
              </div>
            );

            return lesson.unlocked ? (
              <Link key={lesson.id} href={`/student/curriculum/${levelSlug}/${unitSlug}/${lesson.slug}`}
                className={`block border rounded-xl p-4 transition-all ${statusColor}`}>
                {inner}
              </Link>
            ) : (
              <div key={lesson.id} className={`border rounded-xl p-4 cursor-not-allowed ${statusColor}`}>
                {inner}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
