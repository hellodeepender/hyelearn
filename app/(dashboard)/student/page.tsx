import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import { getLevelsWithProgress } from "@/lib/curriculum";

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ subscription?: string }> }) {
  const params = await searchParams;
  const showSubscriptionSuccess = params.subscription === "success";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  const levels = await getLevelsWithProgress(supabase, user.id);
  const currentLevel = levels.find((l) => l.unlocked && l.completedLessons < l.totalLessons) ?? levels[0];
  const totalCurriculumLessons = levels.reduce((s, l) => s + l.totalLessons, 0);
  const completedCurriculumLessons = levels.reduce((s, l) => s + l.completedLessons, 0);

  // Check if student did a lesson today (for Daily 5)
  const today = new Date().toISOString().split("T")[0];
  const { data: todayProgress } = await supabase
    .from("student_progress")
    .select("id")
    .eq("student_id", user.id)
    .gte("completed_at", today)
    .limit(1);
  const didLessonToday = (todayProgress?.length ?? 0) > 0;

  // Streak: count consecutive days
  const { data: recentProgress } = await supabase
    .from("student_progress")
    .select("completed_at")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(30);
  let streak = 0;
  if (recentProgress && recentProgress.length > 0) {
    const uniqueDays = new Set(recentProgress.map((p) => p.completed_at?.split("T")[0]));
    const sorted = Array.from(uniqueDays).filter(Boolean).sort().reverse();
    const oneDay = 86400000;
    const todayTs = new Date(today).getTime();
    if (sorted[0] && new Date(sorted[0]).getTime() >= todayTs - oneDay) {
      streak = 1;
      for (let i = 1; i < sorted.length; i++) {
        if (new Date(sorted[i - 1]).getTime() - new Date(sorted[i]).getTime() <= oneDay) {
          streak++;
        } else break;
      }
    }
  }

  const { data: sessions } = await supabase
    .from("exercise_sessions")
    .select("id")
    .eq("student_id", user.id);

  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <StudentNav />

        {showSubscriptionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
            <p className="font-medium">Welcome to HyeLearn Full Access!</p>
            <p className="text-sm text-green-600 mt-0.5">You now have access to all lessons and unlimited practice.</p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-brown-800 mb-2">Welcome, {firstName}!</h1>
        <p className="text-brown-500 mb-8">Continue your Armenian learning journey.</p>

        {/* Daily 5 */}
        <section className="mb-8">
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-6">
            {didLessonToday ? (
              <div className="text-center">
                <div className="text-4xl mb-2">{"\u2705"}</div>
                <p className="font-semibold text-brown-800">Great job today!</p>
                <p className="text-sm text-brown-500 mt-1">Come back tomorrow for your next lesson.</p>
                {streak > 1 && <p className="text-sm text-gold font-medium mt-2">{streak}-day streak!</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-brown-400 uppercase mb-1">Your daily 5 minutes</p>
                  <p className="font-semibold text-brown-800">{currentLevel?.title ?? "Start learning"}</p>
                  {streak > 0 && <p className="text-xs text-gold font-medium mt-1">{streak}-day streak! Keep it going!</p>}
                </div>
                <Link href="/student/curriculum" className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
                  Start Today&apos;s Lesson
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Progress */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-brown-800 mb-4">My Progress</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">Lessons</h3>
              <p className="text-3xl font-bold text-gold">{completedCurriculumLessons}</p>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">Streak</h3>
              <p className="text-3xl font-bold text-gold">{streak} day{streak !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">Practice</h3>
              <p className="text-3xl font-bold text-gold">{sessions?.length ?? 0}</p>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">Curriculum</h2>
            <Link href="/student/curriculum" className="text-sm text-gold hover:text-gold-dark font-medium">View all &rarr;</Link>
          </div>
          {currentLevel && (
            <div className="bg-warm-white border border-brown-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-brown-800">{currentLevel.title}</h3>
                  <p className="text-sm text-brown-400">{currentLevel.description}</p>
                </div>
                <Link href="/student/curriculum" className="bg-gold hover:bg-gold-dark text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors">
                  Continue
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-brown-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width: `${totalCurriculumLessons > 0 ? Math.round((completedCurriculumLessons / totalCurriculumLessons) * 100) : 0}%` }} />
                </div>
                <span className="text-xs text-brown-400 shrink-0">{completedCurriculumLessons}/{totalCurriculumLessons}</span>
              </div>
            </div>
          )}
        </section>

        {/* Extra Practice */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">Extra Practice</h2>
          </div>
          <Link href="/practice" className="inline-block border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors">
            Start Extra Practice
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 px-6 border-t border-brown-100">
        <div className="max-w-6xl mx-auto text-center text-xs text-brown-400">
          HyeLearn &middot; Made with love for the Armenian diaspora
        </div>
      </footer>
    </div>
  );
}
