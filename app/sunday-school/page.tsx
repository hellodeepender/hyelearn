import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getLocale, getServerLocale } from "@/lib/server-locale";
import { getTranslations } from "@/lib/translations";

interface SundayUnit {
  id: string;
  unit_number: number;
  title: string;
  title_native: string;
  description: string | null;
  season: string | null;
  week_start: number;
  week_end: number;
}

interface SundayLesson {
  id: string;
  unit_id: string;
  lesson_number: number;
  title: string;
  title_native: string;
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // School year: Sept 1 (week 1) through May 31 (week 36)
  // Sept=8, Oct=9, Nov=10, Dec=11, Jan=0, Feb=1, Mar=2, Apr=3, May=4
  if (month >= 5 && month <= 7) return 0; // Summer — outside range

  let weekNum: number;
  if (month >= 8) {
    // Sept-Dec: months 8-11
    const sept1 = new Date(now.getFullYear(), 8, 1);
    const diffDays = Math.floor((now.getTime() - sept1.getTime()) / 86400000);
    weekNum = Math.floor(diffDays / 7) + 1;
  } else {
    // Jan-May: months 0-4
    const sept1 = new Date(now.getFullYear() - 1, 8, 1);
    const diffDays = Math.floor((now.getTime() - sept1.getTime()) / 86400000);
    weekNum = Math.floor(diffDays / 7) + 1;
  }

  return Math.max(1, Math.min(36, weekNum));
}

export default async function SundaySchoolPage() {
  const locale = await getLocale();
  const { brandName } = await getServerLocale();
  const tc = await getTranslations("common");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: units, error: unitsErr } = await supabase
    .from("sunday_units")
    .select("id, unit_number, title, title_native, description, season, week_start, week_end")
    .eq("locale", locale)
    .order("unit_number");

  if (unitsErr) console.error("[sunday-school] Units query error:", unitsErr.message);

  const { data: lessons, error: lessonsErr } = await supabase
    .from("sunday_lessons")
    .select("id, unit_id, lesson_number, title, title_native")
    .eq("locale", locale)
    .order("lesson_number");

  if (lessonsErr) console.error("[sunday-school] Lessons query error:", lessonsErr.message);

  const allUnits = (units ?? []) as SundayUnit[];
  const allLessons = (lessons ?? []) as SundayLesson[];

  const weekNum = getCurrentWeekNumber();
  const currentLesson = allLessons.find((l) => l.lesson_number === weekNum) ?? allLessons[0] ?? null;
  const currentUnit = currentLesson ? allUnits.find((u) => u.id === currentLesson.unit_id) : null;

  const isGreek = locale === "el";
  const accentColor = isGreek ? "text-blue-600" : "text-gold";
  const accentBg = isGreek ? "bg-blue-600" : "bg-gold";
  const accentBgHover = isGreek ? "hover:bg-blue-700" : "hover:bg-gold-dark";
  const accentBorder = isGreek ? "border-blue-200" : "border-gold/20";
  const accentBgLight = isGreek ? "bg-blue-50" : "bg-gold/5";

  // Empty state
  if (allLessons.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <SundayHeader brandName={brandName} locale={locale} language={tc("language")} />
        <main className="max-w-2xl mx-auto px-6 py-16 text-center">
          <div className="text-5xl mb-4">{isGreek ? "\u26EA" : "\u26EA"}</div>
          <h1 className="text-3xl font-bold text-brown-800 mb-3">Sunday School</h1>
          <p className="text-brown-500 mb-6">
            {tc("language")} Sunday School lessons are coming soon. We&apos;re preparing a full year of lessons for teachers and church educators.
          </p>
          <Link href="/" className="text-sm text-brown-400 hover:text-brown-600">
            &larr; Back to {brandName}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <SundayHeader brandName={brandName} locale={locale} language={tc("language")} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Hero: This Week's Lesson */}
        {currentLesson && (
          <section className={`${accentBgLight} border ${accentBorder} rounded-2xl p-8 mb-10`}>
            <p className="text-xs font-medium text-brown-400 uppercase mb-2">
              {weekNum > 0 ? `Week ${weekNum}` : "Featured Lesson"}{currentUnit ? ` \u00B7 ${currentUnit.title}` : ""}
            </p>
            <h1 className="text-2xl font-bold text-brown-800 mb-1">{currentLesson.title}</h1>
            {currentLesson.title_native && (
              <p className={`text-lg ${accentColor} font-medium mb-4`}>{currentLesson.title_native}</p>
            )}
            <Link
              href={`/sunday-school/${currentLesson.id}`}
              className={`inline-block ${accentBg} ${accentBgHover} text-white px-8 py-3 rounded-lg font-semibold transition-colors`}
            >
              Start Lesson
            </Link>
          </section>
        )}

        {/* Unit listing */}
        <h2 className="text-lg font-semibold text-brown-800 mb-4">All Lessons</h2>
        <div className="space-y-4">
          {allUnits.map((unit) => {
            const unitLessons = allLessons.filter((l) => l.unit_id === unit.id);
            return (
              <details key={unit.id} className="bg-warm-white border border-brown-100 rounded-xl overflow-hidden group" open={currentUnit?.id === unit.id}>
                <summary className="px-5 py-4 cursor-pointer select-none flex items-center justify-between hover:bg-brown-50/50 transition-colors">
                  <div>
                    <h3 className="font-semibold text-brown-800">{unit.title}</h3>
                    {unit.title_native && <p className="text-sm text-brown-400">{unit.title_native}</p>}
                    {unit.season && <span className="text-xs text-brown-300">{unit.season}</span>}
                  </div>
                  <div className="text-xs text-brown-400 shrink-0 ml-4">
                    {unitLessons.length} lesson{unitLessons.length !== 1 ? "s" : ""}
                    <span className="ml-2 group-open:rotate-180 inline-block transition-transform">{"\u25BC"}</span>
                  </div>
                </summary>
                <div className="border-t border-brown-100">
                  {unitLessons.map((lesson) => {
                    const isCurrent = currentLesson?.id === lesson.id;
                    return (
                      <Link
                        key={lesson.id}
                        href={`/sunday-school/${lesson.id}`}
                        className={`block px-5 py-3 border-b border-brown-50 last:border-0 transition-colors ${
                          isCurrent ? `${accentBgLight} ${accentBorder}` : "hover:bg-brown-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isCurrent ? `${accentBg} text-white` : "bg-brown-100 text-brown-500"
                          }`}>
                            {lesson.lesson_number}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-brown-800">{lesson.title}</p>
                            {lesson.title_native && (
                              <p className="text-xs text-brown-400">{lesson.title_native}</p>
                            )}
                          </div>
                          {isCurrent && (
                            <span className={`ml-auto text-xs font-medium ${accentColor}`}>This week</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>

        {/* K-5 Curriculum CTA */}
        <div className={`${accentBgLight} border ${accentBorder} rounded-xl p-5 mt-10 flex items-center justify-between gap-4`}>
          <div>
            <p className="font-medium text-brown-800 text-sm">Want your child to learn {isGreek ? "Greek" : "Armenian"} at home?</p>
            <p className="text-xs text-brown-500 mt-0.5">K-5 curriculum with interactive lessons, badges, and progress tracking.</p>
          </div>
          <Link href="/signup" className={`${accentBg} ${isGreek ? "hover:bg-blue-700" : "hover:bg-gold-dark"} text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors shrink-0`}>
            Try It &rarr;
          </Link>
        </div>
      </main>

      <footer className="py-6 px-6 border-t border-brown-100 mt-10">
        <div className="max-w-3xl mx-auto text-center text-xs text-brown-400">
          <Link href="/" className="hover:text-brown-600">&larr; Back to {brandName}</Link>
        </div>
      </footer>
    </div>
  );
}

function SundayHeader({ brandName, locale, language }: { brandName: string; locale: string; language: string }) {
  const isGreek = locale === "el";
  return (
    <header className="bg-warm-white border-b border-brown-100">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className={`text-xl font-bold ${isGreek ? "text-blue-600" : "text-gold"}`}>
            {isGreek ? "\u039C" : "\u0531"}
          </span>
          <span className="text-sm font-semibold text-brown-800">{brandName}</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-brown-600">{language} Sunday School</span>
          <Link href="/login" className="text-xs text-brown-400 hover:text-brown-600">Log in</Link>
        </div>
      </div>
    </header>
  );
}
