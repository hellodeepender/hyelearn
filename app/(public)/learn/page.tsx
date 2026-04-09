import Link from "next/link";
import { getLocale } from "@/lib/server-locale";
import { getPublicLevels, getPublicLocales } from "@/lib/curriculum-public";
import { getEnglishTitle } from "@/lib/grade-labels";
import PublicHeader from "@/components/ui/PublicHeader";
import SiteFooter from "@/components/ui/SiteFooter";

const LOCALE_META: Record<string, { name: string; flag: string }> = {
  hy: { name: "Armenian", flag: "\u0531" },
  el: { name: "Greek", flag: "\u039C" },
  ar: { name: "Arabic", flag: "\u0639" },
  tl: { name: "Tagalog", flag: "T" },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const sp = await searchParams;
  const loc = sp.locale;
  const lang = loc ? (LOCALE_META[loc]?.name ?? "Heritage Language") : "Heritage Language";
  return {
    title: `Free ${lang} Curriculum for Kids — DiasporaLearn`,
    description: `Browse our complete K-5 ${lang} curriculum. Free interactive lessons for diaspora children.`,
  };
}

export default async function PublicCurriculumPage({ searchParams }: { searchParams: Promise<{ locale?: string }> }) {
  const sp = await searchParams;
  const domainLocale = await getLocale();

  // Determine which locale to show:
  // 1. ?locale= query param (explicit selection)
  // 2. Domain locale if it has curriculum (hy, el, ar, tl — NOT en)
  // 3. Default to showing the language picker with no levels
  const availableLocales = await getPublicLocales();
  const requestedLocale = sp.locale && availableLocales.includes(sp.locale) ? sp.locale : null;
  const effectiveLocale = requestedLocale ?? (domainLocale !== "en" && availableLocales.includes(domainLocale) ? domainLocale : null);

  const levels = effectiveLocale ? await getPublicLevels(effectiveLocale) : [];
  const langName = effectiveLocale ? (LOCALE_META[effectiveLocale]?.name ?? effectiveLocale) : null;

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brown-800 mb-1">
            {langName ? `${langName} Curriculum` : "Choose a Language"}
          </h1>
          <p className="text-brown-500 text-sm">Free interactive lessons for every grade level</p>
        </div>

        {/* Language tabs */}
        {availableLocales.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {availableLocales.map((loc) => {
              const meta = LOCALE_META[loc];
              const isActive = loc === effectiveLocale;
              return (
                <Link
                  key={loc}
                  href={`/learn?locale=${loc}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-gold text-white"
                      : "bg-warm-white border border-brown-100 text-brown-600 hover:border-brown-200 hover:shadow-sm"
                  }`}
                >
                  <span className="text-base">{meta?.flag ?? loc[0].toUpperCase()}</span>
                  {meta?.name ?? loc}
                </Link>
              );
            })}
          </div>
        )}

        {/* Level cards */}
        {levels.length > 0 ? (
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
                    {getEnglishTitle(level.title, effectiveLocale!) && (
                      <p className="text-xs text-brown-400">{getEnglishTitle(level.title, effectiveLocale!)}</p>
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
        ) : !effectiveLocale ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">{"\uD83C\uDF0D"}</p>
            <p className="text-brown-500">Select a language above to browse the curriculum</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-brown-500">No lessons available yet for {langName}. Check back soon!</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
