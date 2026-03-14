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

  // Role guard: only students can access this page
  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  // Fetch exercise stats
  const { data: sessions } = await supabase
    .from("exercise_sessions")
    .select("score, total")
    .eq("student_id", user.id);

  const sessionCount = sessions?.length ?? 0;
  const totalScore = sessions?.reduce((sum, s) => sum + (s.score ?? 0), 0) ?? 0;
  const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total ?? 0), 0) ?? 0;
  const avgScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Student"}
        userRole={profile?.role ?? "student"}
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">
          Welcome, {firstName}
        </h1>
        <p className="text-brown-500 mb-8">Continue your Armenian learning journey.</p>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Exercises Completed</h3>
            <p className="text-3xl font-bold text-gold">{sessionCount}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Average Score</h3>
            <p className="text-3xl font-bold text-gold">
              {sessionCount > 0 ? `${avgScore}%` : "No data yet"}
            </p>
          </div>
        </div>
        <Link
          href="/practice"
          className="inline-block bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Start Practicing
        </Link>
      </main>
    </div>
  );
}
