import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import { getLevelsWithProgress } from "@/lib/curriculum";

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  // Curriculum progress
  const levels = await getLevelsWithProgress(supabase, user.id);
  const currentLevel = levels.find((l) => l.unlocked && l.completedLessons < l.totalLessons) ?? levels[0];
  const totalCurriculumLessons = levels.reduce((s, l) => s + l.totalLessons, 0);
  const completedCurriculumLessons = levels.reduce((s, l) => s + l.completedLessons, 0);

  // Extra practice stats
  const { data: sessions } = await supabase
    .from("exercise_sessions")
    .select("id, subject, topic, exercise_type, score, total, completed_at")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(5);

  const allSessions = sessions ?? [];
  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <StudentNav />
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Welcome, {firstName}!</h1>
        <p className="text-brown-500 mb-10">Continue your Armenian learning journey.</p>

        {/* My Curriculum */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">My Curriculum</h2>
            <Link href="/student/curriculum" className="text-sm text-gold hover:text-gold-dark font-medium">
              View all &rarr;
            </Link>
          </div>

          {currentLevel && (
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-brown-800 text-lg">{currentLevel.title}</h3>
                  <p className="text-sm text-brown-400">{currentLevel.description}</p>
                </div>
                <Link
                  href="/student/curriculum"
                  className="bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Continue
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-brown-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full"
                    style={{ width: `${totalCurriculumLessons > 0 ? Math.round((completedCurriculumLessons / totalCurriculumLessons) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-brown-400 shrink-0">
                  {completedCurriculumLessons}/{totalCurriculumLessons} lessons
                </span>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">Lessons Completed</h3>
              <p className="text-3xl font-bold text-gold">{completedCurriculumLessons}</p>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">AI Practice Sessions</h3>
              <p className="text-3xl font-bold text-gold">{allSessions.length}</p>
            </div>
          </div>
        </section>

        {/* Extra Practice */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">Extra Practice (AI)</h2>
          </div>

          {allSessions.length > 0 ? (
            <div className="bg-warm-white border border-brown-100 rounded-xl divide-y divide-brown-100 mb-4">
              {allSessions.map((s) => {
                const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                const date = new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-brown-800 capitalize">{s.topic}</p>
                      <p className="text-xs text-brown-400 capitalize">{s.subject} &middot; {s.exercise_type?.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${pct >= 70 ? "text-green-600" : "text-brown-500"}`}>{pct}%</p>
                      <p className="text-xs text-brown-400">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-brown-400 mb-4">No AI practice sessions yet.</p>
          )}

          <Link
            href="/practice"
            className="inline-block border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Start AI Practice
          </Link>
        </section>
      </main>
    </div>
  );
}
