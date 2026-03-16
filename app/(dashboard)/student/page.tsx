import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import { getLevelsWithProgress } from "@/lib/curriculum";
import { getCurrentLevel, getProgressToNextLevel } from "@/lib/xp";
import { BADGES } from "@/lib/badges";

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ subscription?: string }> }) {
  const params = await searchParams;
  const showSubscriptionSuccess = params.subscription === "success";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, subscription_tier, total_xp").eq("id", user.id).single();
  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  const levels = await getLevelsWithProgress(supabase, user.id);
  const currentLevel = levels.find((l) => l.unlocked && l.completedLessons < l.totalLessons) ?? levels[0];
  const totalCurriculumLessons = levels.reduce((s, l) => s + l.totalLessons, 0);
  const completedCurriculumLessons = levels.reduce((s, l) => s + l.completedLessons, 0);

  // Check if student completed a lesson today (passed = true, score IS NOT NULL)
  const today = new Date().toISOString().split("T")[0];
  const { data: todayProgress } = await supabase
    .from("student_progress")
    .select("id")
    .eq("student_id", user.id)
    .eq("passed", true)
    .not("score", "is", null)
    .gte("completed_at", today)
    .limit(1);
  const didLessonToday = (todayProgress?.length ?? 0) > 0;

  // Streak: count consecutive days with actual completed exercises
  const { data: recentProgress } = await supabase
    .from("student_progress")
    .select("completed_at")
    .eq("student_id", user.id)
    .eq("passed", true)
    .not("score", "is", null)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(60);
  let streak = 0;
  if (recentProgress && recentProgress.length > 0) {
    const uniqueDays = [...new Set(recentProgress.map((p) => p.completed_at!.split("T")[0]))].sort().reverse();
    const oneDay = 86400000;
    const todayTs = new Date(today).getTime();
    // Most recent activity must be today or yesterday
    if (uniqueDays[0] && new Date(uniqueDays[0]).getTime() >= todayTs - oneDay) {
      streak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const diff = new Date(uniqueDays[i - 1]).getTime() - new Date(uniqueDays[i]).getTime();
        if (diff <= oneDay) {
          streak++;
        } else break;
      }
    }
  }

  const { data: sessions } = await supabase
    .from("exercise_sessions")
    .select("id")
    .eq("student_id", user.id);

  // Find next lesson for the CTA
  const { data: allProgress } = await supabase
    .from("student_progress")
    .select("lesson_id, passed")
    .eq("student_id", user.id);
  const passedLessonIds = new Set((allProgress ?? []).filter((p) => p.passed).map((p) => p.lesson_id));

  // Find the first unpassed lesson across all levels/units
  let nextLessonUrl: string | null = null;
  let nextLessonTitle: string | null = null;
  const { data: allUnits } = await supabase
    .from("curriculum_units")
    .select("id, slug, level_id, sort_order, curriculum_levels!inner(slug)")
    .eq("is_active", true)
    .order("sort_order");
  const { data: allLessons } = await supabase
    .from("curriculum_lessons")
    .select("id, slug, title, unit_id, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const freeTier = !profile?.subscription_tier || profile.subscription_tier === "free";
  if (allUnits && allLessons) {
    for (const unit of allUnits) {
      const levelSlug = (unit.curriculum_levels as unknown as { slug: string }).slug;
      const unitLessons = allLessons.filter((l) => l.unit_id === unit.id);
      for (const lesson of unitLessons) {
        if (!passedLessonIds.has(lesson.id)) {
          // Free tier can only access lesson 1 of each unit
          if (freeTier && lesson.sort_order > 1) {
            nextLessonUrl = "/pricing";
            nextLessonTitle = null;
          } else {
            nextLessonUrl = `/student/curriculum/${levelSlug}/${unit.slug}/${lesson.slug}`;
            nextLessonTitle = lesson.title;
          }
          break;
        }
      }
      if (nextLessonUrl) break;
    }
  }

  // Find what was completed today
  let todayLessonTitle: string | null = null;
  if (didLessonToday) {
    const { data: todayDetail } = await supabase
      .from("student_progress")
      .select("lesson_id, curriculum_lessons!inner(title)")
      .eq("student_id", user.id)
      .gte("completed_at", today)
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();
    if (todayDetail) {
      todayLessonTitle = (todayDetail.curriculum_lessons as unknown as { title: string }).title;
    }
  }

  const allComplete = totalCurriculumLessons > 0 && completedCurriculumLessons >= totalCurriculumLessons;
  const neverStarted = completedCurriculumLessons === 0 && !didLessonToday;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";
  const isFree = !profile?.subscription_tier || profile.subscription_tier === "free";

  // XP & badges
  const araratProgress = getProgressToNextLevel(profile?.total_xp ?? 0);
  const { data: earnedBadges } = await supabase.from("student_badges").select("badge_slug").eq("student_id", user.id);
  const earnedBadgeSlugs = new Set((earnedBadges ?? []).map((b) => b.badge_slug));

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <StudentNav subscriptionTier={profile?.subscription_tier} />

        {showSubscriptionSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6">
            <p className="font-medium">Welcome to HyeLearn Full Access!</p>
            <p className="text-sm text-green-600 mt-0.5">You now have access to all lessons and unlimited practice.</p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-brown-800 mb-2">Welcome, {firstName}!</h1>
        <p className="text-brown-500 mb-8">Continue your Armenian learning journey.</p>

        {/* Contextual message */}
        <section className="mb-8">
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-6">
            {allComplete ? (
              <div className="text-center">
                <div className="text-4xl mb-2">{"\u2B50"}</div>
                <p className="font-semibold text-brown-800">You&apos;re a star!</p>
                <p className="text-sm text-brown-500 mt-1">You&apos;ve completed all available lessons. Check back for new content!</p>
                {streak > 1 && <p className="text-sm text-gold font-medium mt-2">{streak}-day streak!</p>}
              </div>
            ) : didLessonToday ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl mb-1">{"\u2705"}</div>
                  <p className="font-semibold text-brown-800">Great job today!</p>
                  {todayLessonTitle && <p className="text-sm text-brown-500 mt-0.5">You completed {todayLessonTitle}!</p>}
                  {streak > 1 && <p className="text-xs text-gold font-medium mt-1">{streak}-day streak!</p>}
                </div>
                {nextLessonUrl && (
                  <Link href={nextLessonUrl} className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
                    {nextLessonUrl === "/pricing" ? "Upgrade to Continue" : "Keep Going"}
                  </Link>
                )}
              </div>
            ) : neverStarted ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-brown-400 uppercase mb-1">Your daily 5 minutes</p>
                  <p className="font-semibold text-brown-800">Let&apos;s get started!</p>
                  <p className="text-sm text-brown-500 mt-0.5">Begin your Armenian learning journey</p>
                </div>
                <Link href={nextLessonUrl ?? "/student/curriculum"} className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
                  Start Learning
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-brown-400 uppercase mb-1">Your daily 5 minutes</p>
                  <p className="font-semibold text-brown-800">Ready to learn?</p>
                  <p className="text-sm text-brown-500 mt-0.5">Continue where you left off</p>
                  {streak > 0 && <p className="text-xs text-gold font-medium mt-1">{streak}-day streak! Keep it going!</p>}
                </div>
                <Link href={nextLessonUrl ?? "/student/curriculum"} className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm">
                  {nextLessonUrl === "/pricing" ? "Upgrade to Continue" : "Continue Lesson"}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Upgrade banner for free tier */}
        {isFree && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-gold/10 to-amber-50 border border-gold/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-brown-800">Unlock all lessons across K-5</p>
                <p className="text-sm text-brown-500 mt-0.5">You&apos;re on the free plan. Upgrade for full access.</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <Link href="/pricing" className="bg-gold hover:bg-gold-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors inline-block">
                  Upgrade
                </Link>
              </div>
            </div>
          </section>
        )}

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
              <p className="text-3xl font-bold text-gold">{streak >= 3 ? "\uD83D\uDD25 " : ""}{streak} day{streak !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
              <h3 className="text-sm font-medium text-brown-500 mb-1">{araratProgress.current.emoji} Level</h3>
              <p className="text-lg font-bold text-gold">{araratProgress.current.name}</p>
              <div className="w-full h-1.5 bg-brown-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${araratProgress.percentage}%` }} />
              </div>
              <p className="text-xs text-brown-400 mt-1">{profile?.total_xp ?? 0} XP</p>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">My Badges</h2>
            <Link href="/student/profile" className="text-sm text-gold hover:text-gold-dark font-medium">View all &rarr;</Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-3 snap-x snap-mandatory">
            {BADGES.slice(0, 6).map((badge) => {
              const isEarned = earnedBadgeSlugs.has(badge.slug);
              return (
                <div key={badge.slug} className="flex flex-col items-center shrink-0 w-20 snap-start">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${isEarned ? "bg-gold/10 border-2 border-gold/30 shadow-sm" : "bg-brown-50 border-2 border-brown-100"}`}>
                    {isEarned ? badge.emoji : "\uD83D\uDD12"}
                  </div>
                  <p className={`text-sm font-medium mt-2 text-center leading-tight line-clamp-2 ${isEarned ? "text-brown-700" : "text-brown-300"}`}>{badge.name}</p>
                </div>
              );
            })}
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
