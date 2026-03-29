import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getLocale } from "@/lib/server-locale";
import { getPublicLessons } from "@/lib/curriculum-public";
import { getEnglishTitle } from "@/lib/grade-labels";
import PublicHeader from "@/components/ui/PublicHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export async function generateMetadata({ params }: { params: Promise<{ levelSlug: string; unitSlug: string }> }) {
  const { levelSlug, unitSlug } = await params;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data: level } = await db.from("curriculum_levels").select("id, title").eq("slug", levelSlug).single();
  if (!level) return { title: "Curriculum" };
  const { data: unit } = await db.from("curriculum_units").select("title").eq("level_id", level.id).eq("slug", unitSlug).single();
  if (!unit) return { title: level.title };
  return {
    title: `${unit.title} — ${level.title}`,
    description: `Browse all lessons in ${unit.title}. Part of our free heritage language curriculum.`,
  };
}

export default async function PublicUnitPage({ params }: { params: Promise<{ levelSlug: string; unitSlug: string }> }) {
  const { levelSlug, unitSlug } = await params;
  const locale = await getLocale();
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: level } = await db
    .from("curriculum_levels")
    .select("id, title")
    .eq("slug", levelSlug)
    .single();
  if (!level) notFound();

  const { data: unit } = await db
    .from("curriculum_units")
    .select("id, title, description")
    .eq("level_id", level.id)
    .eq("slug", unitSlug)
    .single();
  if (!unit) notFound();

  const lessons = await getPublicLessons(unit.id, locale);

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-brown-400 mb-6">
          <Link href="/learn" className="hover:text-brown-600">Curriculum</Link>
          <span>/</span>
          <Link href={`/learn/${levelSlug}`} className="hover:text-brown-600">{level.title}</Link>
          <span>/</span>
          <span className="text-brown-700">{unit.title}</span>
        </nav>

        <h1 className="text-2xl font-bold text-brown-800 mb-1">{unit.title}</h1>
        {getEnglishTitle(unit.title, locale) && (
          <p className="text-sm text-brown-400 mb-1">{getEnglishTitle(unit.title, locale)}</p>
        )}
        {unit.description && <p className="text-brown-500 text-sm mb-8">{unit.description}</p>}

        <div className="space-y-2">
          {lessons.map((lesson) => {
            const typeBadge = lesson.lesson_type === "quiz"
              ? "bg-amber-100 text-amber-700"
              : lesson.lesson_type === "final_test"
              ? "bg-purple-100 text-purple-700"
              : "bg-brown-100 text-brown-600";

            return (
              <Link
                key={lesson.id}
                href={`/learn/${levelSlug}/${unitSlug}/${lesson.slug}`}
                className="block border border-brown-100 rounded-xl p-4 bg-warm-white hover:shadow-md hover:border-brown-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-gold/10 text-gold">
                    {"\u25B6"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-brown-800">
                        {lesson.title}
                        {getEnglishTitle(lesson.title, locale) && (
                          <span className="text-xs text-brown-400 font-normal ml-2">
                            ({getEnglishTitle(lesson.title, locale)})
                          </span>
                        )}
                      </h3>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${typeBadge}`}>
                        {lesson.lesson_type === "quiz" ? "Quiz" : lesson.lesson_type === "final_test" ? "Final" : "Practice"}
                      </span>
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-brown-400 mt-0.5">{lesson.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
