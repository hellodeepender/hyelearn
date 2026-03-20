import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getLevelsWithProgress } from "@/lib/curriculum";
import { getLocale } from "@/lib/server-locale";
import { getEnglishTitle } from "@/lib/grade-labels";
import MapPath from "@/components/curriculum/MapPath";

export default async function CurriculumPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const viewMode = params.view === "map" ? "map" : "list";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, subscription_tier")
    .eq("id", user.id)
    .single();

  const locale = await getLocale();
  const levels = await getLevelsWithProgress(supabase, user.id, locale);

  const totalCompleted = levels.reduce((s, l) => s + l.completedLessons, 0);
  const totalLessons = levels.reduce((s, l) => s + l.totalLessons, 0);

  const mapNodes = levels.map((level) => ({
    id: level.id,
    title: level.title,
    slug: level.slug,
    completedLessons: level.completedLessons,
    totalLessons: level.totalLessons,
    unlocked: level.unlocked,
    href: `/student/curriculum/${level.slug}`,
    englishTitle: getEnglishTitle(level.title, locale) ?? undefined,
  }));

  const summitLabel = locale === "el" ? "Mount Olympus" : "Mount Ararat";

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />

      {viewMode === "map" ? (
        <main className="max-w-4xl mx-auto px-6 py-10">
          <StudentNav subscriptionTier={profile?.subscription_tier} />
          <div className="flex items-center justify-between mb-4">
            <Link href="/student" className="flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700">
              <span>{"\u2190"}</span> Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-brown-400">{totalCompleted}/{totalLessons} completed</span>
              <ViewToggle viewMode={viewMode} baseHref="/student/curriculum" />
            </div>
          </div>
          <MapPath
            nodes={mapNodes}
            locale={locale}
            summitLabel={summitLabel}
            subtitle="All Grades"
          />
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-6 py-10">
          <StudentNav subscriptionTier={profile?.subscription_tier} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <Breadcrumbs items={[{ label: "Dashboard", href: "/student" }, { label: "Curriculum" }]} />
              <h1 className="text-3xl font-bold text-brown-800 mb-1">Curriculum</h1>
              <p className="text-brown-500 text-sm">Your structured learning path</p>
            </div>
            <ViewToggle viewMode={viewMode} baseHref="/student/curriculum" />
          </div>

          <div className="space-y-4">
            {levels.map((level) => {
              const pct = level.totalLessons > 0 ? Math.round((level.completedLessons / level.totalLessons) * 100) : 0;
              const isComplete = level.totalLessons > 0 && level.completedLessons === level.totalLessons;

              return (
                <div key={level.id} className={`border rounded-2xl p-6 transition-all ${
                  level.unlocked
                    ? "bg-warm-white border-brown-100 hover:shadow-md"
                    : "bg-brown-50 border-brown-100 opacity-60"
                }`}>
                  {level.unlocked ? (
                    <Link href={`/student/curriculum/${level.slug}`} className="block">
                      <LevelContent level={level} pct={pct} isComplete={isComplete} locale={locale} />
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">
                      <LevelContent level={level} pct={pct} isComplete={isComplete} locked locale={locale} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}
    </div>
  );
}

function ViewToggle({ viewMode, baseHref }: { viewMode: string; baseHref: string }) {
  return (
    <div className="flex gap-1 bg-brown-50 rounded-lg p-1">
      <Link href={`${baseHref}?view=list`}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "list" ? "bg-warm-white text-brown-800 shadow-sm" : "text-brown-400 hover:text-brown-600"}`}>
        List
      </Link>
      <Link href={`${baseHref}?view=map`}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "map" ? "bg-warm-white text-brown-800 shadow-sm" : "text-brown-400 hover:text-brown-600"}`}>
        Quest
      </Link>
    </div>
  );
}

function LevelContent({ level, pct, isComplete, locked, locale }: {
  level: { title: string; description: string | null; completedLessons: number; totalLessons: number; grade_value: string };
  pct: number; isComplete: boolean; locked?: boolean; locale: string;
}) {
  const enTitle = getEnglishTitle(level.title, locale);
  return (
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
        isComplete ? "bg-green-100 text-green-700" : locked ? "bg-brown-100 text-brown-400" : "bg-gold/10 text-gold"
      }`}>
        {locked ? "\u{1F512}" : isComplete ? "\u2713" : level.grade_value}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-brown-800 text-lg">{level.title}</h3>
        {enTitle && <p className="text-xs text-brown-400">{enTitle}</p>}
        {level.description && <p className="text-sm text-brown-400 mt-0.5">{level.description}</p>}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-brown-400 mb-1">
            <span>{level.completedLessons}/{level.totalLessons} lessons</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isComplete ? "bg-green-500" : "bg-gold"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
