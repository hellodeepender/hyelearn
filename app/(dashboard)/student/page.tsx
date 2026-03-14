import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";

export default async function StudentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  // Fetch exercise sessions for stats and recent activity
  const { data: sessions } = await supabase
    .from("exercise_sessions")
    .select("id, subject, topic, exercise_type, score, total, completed_at")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50);

  const allSessions = sessions ?? [];
  const sessionCount = allSessions.length;
  const totalScore = allSessions.reduce((sum, s) => sum + (s.score ?? 0), 0);
  const totalQuestions = allSessions.reduce((sum, s) => sum + (s.total ?? 0), 0);
  const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
  const bestScore = allSessions.length > 0
    ? Math.round(Math.max(...allSessions.map((s) => (s.total > 0 ? (s.score / s.total) * 100 : 0))))
    : 0;

  // Streak: count consecutive days with activity
  let streak = 0;
  if (allSessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const uniqueDays = new Set(
      allSessions.map((s) => {
        const d = new Date(s.completed_at);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    const oneDay = 86400000;
    // Check if most recent day is today or yesterday
    if (sortedDays[0] >= today.getTime() - oneDay) {
      streak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        if (sortedDays[i - 1] - sortedDays[i] <= oneDay) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  const recentSessions = allSessions.slice(0, 5);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Student"}
        userRole={profile?.role ?? "student"}
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">
          Welcome, {firstName}!
        </h1>
        <p className="text-brown-500 mb-8">Continue your Armenian learning journey.</p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Completed</h3>
            <p className="text-3xl font-bold text-gold">{sessionCount}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Average Score</h3>
            <p className="text-3xl font-bold text-gold">
              {sessionCount > 0 ? `${avgScore}%` : "--"}
            </p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Day Streak</h3>
            <p className="text-3xl font-bold text-gold">{streak}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Best Score</h3>
            <p className="text-3xl font-bold text-gold">
              {sessionCount > 0 ? `${bestScore}%` : "--"}
            </p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-brown-800 mb-4">Recent Activity</h2>
          {recentSessions.length > 0 ? (
            <div className="bg-warm-white border border-brown-100 rounded-xl divide-y divide-brown-100">
              {recentSessions.map((s) => {
                const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0;
                const date = new Date(s.completed_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-brown-800 capitalize">
                        {s.topic}
                      </p>
                      <p className="text-xs text-brown-400 capitalize">
                        {s.subject} &middot; {s.exercise_type?.replace("_", " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${pct >= 70 ? "text-green-600" : "text-brown-500"}`}>
                        {s.score}/{s.total} ({pct}%)
                      </p>
                      <p className="text-xs text-brown-400">{date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
              <p className="text-brown-400">You haven&apos;t completed any exercises yet.</p>
              <p className="text-brown-300 text-sm mt-1">Start your first practice session!</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/practice"
          className="inline-block bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-lg text-lg font-semibold transition-colors shadow-lg shadow-gold/20"
        >
          Start Practicing
        </Link>
      </main>
    </div>
  );
}
