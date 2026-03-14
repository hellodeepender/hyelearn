import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import { getLevelsWithProgress } from "@/lib/curriculum";

export default async function CurriculumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const levels = await getLevelsWithProgress(supabase, user.id);

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Curriculum</h1>
            <p className="text-brown-500 text-sm mt-1">Your structured learning path</p>
          </div>
          <Link href="/student" className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg transition-colors">
            Dashboard
          </Link>
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
                    <LevelContent level={level} pct={pct} isComplete={isComplete} />
                  </Link>
                ) : (
                  <div className="cursor-not-allowed">
                    <LevelContent level={level} pct={pct} isComplete={isComplete} locked />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function LevelContent({ level, pct, isComplete, locked }: {
  level: { title: string; description: string | null; completedLessons: number; totalLessons: number; grade_value: string };
  pct: number; isComplete: boolean; locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-5">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
        isComplete ? "bg-green-100 text-green-700" : locked ? "bg-brown-100 text-brown-400" : "bg-gold/10 text-gold"
      }`}>
        {locked ? "\u{1F512}" : isComplete ? "\u2713" : level.grade_value}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-brown-800 text-lg">{level.title}</h3>
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
