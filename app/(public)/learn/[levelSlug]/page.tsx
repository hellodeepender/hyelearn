import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getLocale } from "@/lib/server-locale";
import { getPublicUnits } from "@/lib/curriculum-public";
import { getEnglishTitle } from "@/lib/grade-labels";
import PublicHeader from "@/components/ui/PublicHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export async function generateMetadata({ params }: { params: Promise<{ levelSlug: string }> }) {
  const { levelSlug } = await params;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data: level } = await db.from("curriculum_levels").select("title").eq("slug", levelSlug).single();
  if (!level) return { title: "Curriculum" };
  return {
    title: `${level.title} — Curriculum`,
    description: `Browse all units and lessons in ${level.title}. Free interactive heritage language curriculum.`,
  };
}

export default async function PublicLevelPage({ params }: { params: Promise<{ levelSlug: string }> }) {
  const { levelSlug } = await params;
  const locale = await getLocale();
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: level } = await db
    .from("curriculum_levels")
    .select("id, slug, title, description")
    .eq("slug", levelSlug)
    .single();
  if (!level) notFound();

  const units = await getPublicUnits(level.id, locale);

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-brown-400 mb-6">
          <Link href="/learn" className="hover:text-brown-600">Curriculum</Link>
          <span>/</span>
          <span className="text-brown-700">{level.title}</span>
        </nav>

        <h1 className="text-3xl font-bold text-brown-800 mb-1">{level.title}</h1>
        {getEnglishTitle(level.title, locale) && (
          <p className="text-sm text-brown-400 mb-1">{getEnglishTitle(level.title, locale)}</p>
        )}
        {level.description && <p className="text-brown-500 text-sm mb-8">{level.description}</p>}

        <div className="space-y-3">
          {units.map((unit, i) => (
            <Link
              key={unit.id}
              href={`/learn/${levelSlug}/${unit.slug}`}
              className="block bg-warm-white border border-brown-100 rounded-xl p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 bg-gold/10 text-gold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brown-800">{unit.title}</h3>
                  {getEnglishTitle(unit.title, locale) && (
                    <p className="text-xs text-brown-400">{getEnglishTitle(unit.title, locale)}</p>
                  )}
                  {unit.description && (
                    <p className="text-xs text-brown-400 mt-0.5">{unit.description}</p>
                  )}
                  <p className="text-xs text-brown-400 mt-1">{unit.totalLessons} lessons</p>
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
