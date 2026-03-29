import Link from "next/link";
import { getLocale } from "@/lib/server-locale";
import { getPublicLevels } from "@/lib/curriculum-public";
import { getEnglishTitle } from "@/lib/grade-labels";
import PublicHeader from "@/components/ui/PublicHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export async function generateMetadata() {
  const locale = await getLocale();
  const brand = locale === "el" ? "Mathaino" : locale === "ar" ? "Ta3allam" : "HyeLearn";
  const lang = locale === "el" ? "Greek" : locale === "ar" ? "Arabic" : "Armenian";
  return {
    title: `${brand} — Free ${lang} Curriculum for Kids`,
    description: `Browse our complete K-5 ${lang} curriculum. Free interactive lessons for diaspora children.`,
  };
}

export default async function PublicCurriculumPage() {
  const locale = await getLocale();
  const levels = await getPublicLevels(locale);
  const brand = locale === "el" ? "Mathaino" : locale === "ar" ? "Ta3allam" : "HyeLearn";

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown-800 mb-1">{brand} Curriculum</h1>
          <p className="text-brown-500 text-sm">Free interactive lessons for every grade level</p>
        </div>

        <div className="space-y-4">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/learn/${level.slug}`}
              className="block bg-warm-white border border-brown-100 rounded-2xl p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 bg-gold/10 text-gold">
                  {level.grade_value}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown-800 text-lg">{level.title}</h3>
                  {getEnglishTitle(level.title, locale) && (
                    <p className="text-xs text-brown-400">{getEnglishTitle(level.title, locale)}</p>
                  )}
                  {level.description && (
                    <p className="text-sm text-brown-400 mt-0.5">{level.description}</p>
                  )}
                  <p className="text-xs text-brown-400 mt-2">{level.totalLessons} lessons</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
