import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { getUnitsWithProgress } from "@/lib/curriculum";

export default async function LevelPage({ params }: { params: Promise<{ levelSlug: string }> }) {
  const { levelSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, subscription_tier").eq("id", user.id).single();
  const { data: level } = await supabase.from("curriculum_levels").select("id, slug, title, description").eq("slug", levelSlug).single();
  if (!level) notFound();

  const units = await getUnitsWithProgress(supabase, user.id, level.id);

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <StudentNav subscriptionTier={profile?.subscription_tier} />
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/student" },
          { label: "Curriculum", href: "/student/curriculum" },
          { label: level.title },
        ]} />
        <h1 className="text-3xl font-bold text-brown-800 mb-1">{level.title}</h1>
        {level.description && <p className="text-brown-500 mb-8">{level.description}</p>}

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
    </div>
  );
}
