import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getUnitsWithProgress } from "@/lib/curriculum";
import { getLocale } from "@/lib/server-locale";
import { getEnglishTitle } from "@/lib/grade-labels";
import MapPath from "@/components/curriculum/MapPath";

export default async function LevelPage({
  params,
  searchParams,
}: {
  params: Promise<{ levelSlug: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { levelSlug } = await params;
  const sp = await searchParams;
  const viewMode = sp.view === "map" ? "map" : "list";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, subscription_tier").eq("id", user.id).single();
  const { data: level } = await supabase.from("curriculum_levels").select("id, slug, title, description").eq("slug", levelSlug).single();
  if (!level) notFound();

  const locale = await getLocale();
  const units = await getUnitsWithProgress(supabase, user.id, level.id, locale);

  const totalCompleted = units.reduce((s, u) => s + u.completedLessons, 0);
  const totalLessons = units.reduce((s, u) => s + u.totalLessons, 0);

  const mapNodes = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    slug: unit.slug,
    completedLessons: unit.completedLessons,
    totalLessons: unit.totalLessons,
    unlocked: unit.unlocked,
    href: `/student/curriculum/${levelSlug}/${unit.slug}`,
  }));

  const baseHref = `/student/curriculum/${levelSlug}`;

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />

      {viewMode === "map" ? (
        <main className="max-w-4xl mx-auto px-6 py-10">
          <StudentNav subscriptionTier={profile?.subscription_tier} />
          <div className="flex items-center justify-between mb-4">
            <Link href="/student/curriculum" className="flex items-center gap-1 text-sm text-brown-500 hover:text-brown-700">
              <span>{"\u2190"}</span> Curriculum
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-brown-400">{totalCompleted}/{totalLessons} completed</span>
              <ViewToggle viewMode={viewMode} baseHref={baseHref} />
            </div>
          </div>
          <MapPath
            nodes={mapNodes}
            locale={locale}
            summitLabel={`${level.title} Complete!`}
            subtitle={level.description ?? undefined}
          />
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-6 py-10">
          <StudentNav subscriptionTier={profile?.subscription_tier} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <Breadcrumbs items={[
                { label: "Dashboard", href: "/student" },
                { label: "Curriculum", href: "/student/curriculum" },
                { label: level.title },
              ]} />
              <h1 className="text-3xl font-bold text-brown-800 mb-1">{level.title}</h1>
              {level.description && <p className="text-brown-500 text-sm">{level.description}</p>}
            </div>
            <ViewToggle viewMode={viewMode} baseHref={baseHref} />
          </div>

          <div className="space-y-3">
            {units.map((unit, i) => {
              const pct = unit.totalLessons > 0 ? Math.round((unit.completedLessons / unit.totalLessons) * 100) : 0;
              const isComplete = unit.totalLessons > 0 && unit.completedLessons === unit.totalLessons;

              const inner = (
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                    isComplete ? "bg-green-100 text-green-700" : !unit.unlocked ? "bg-brown-100 text-brown-400" : "bg-gold/10 text-gold"
                  }`}>
                    {!unit.unlocked ? "\u{1F512}" : isComplete ? "\u2713" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-brown-800">{unit.title}</h3>
                    {getEnglishTitle(unit.title, locale) && <p className="text-xs text-brown-400">{getEnglishTitle(unit.title, locale)}</p>}
                    {unit.description && <p className="text-xs text-brown-400 mt-0.5">{unit.description}</p>}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-brown-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isComplete ? "bg-green-500" : "bg-gold"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-brown-400 shrink-0">{unit.completedLessons}/{unit.totalLessons}</span>
                    </div>
                  </div>
                </div>
              );

              return unit.unlocked ? (
                <Link key={unit.id} href={`/student/curriculum/${levelSlug}/${unit.slug}`}
                  className="block bg-warm-white border border-brown-100 rounded-xl p-5 hover:shadow-md transition-all">
                  {inner}
                </Link>
              ) : (
                <div key={unit.id} className="bg-brown-50 border border-brown-100 rounded-xl p-5 opacity-60 cursor-not-allowed">
                  {inner}
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
