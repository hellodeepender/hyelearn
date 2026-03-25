import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import SiteFooter from "@/components/ui/SiteFooter";
import StudentNav from "@/components/ui/StudentNav";
import { getLevelsWithProgress } from "@/lib/curriculum";
import { checkAndAwardBadges } from "@/lib/xp";
import { getBadges, getBadgeBySlug } from "@/lib/badges";
import { getEnglishTitle } from "@/lib/grade-labels";
import { getTranslations } from "@/lib/translations";
import { getMascot, getMascotName } from "@/lib/mascots";
import { getServerLocale, getLocale } from "@/lib/server-locale";
import BadgeCelebration from "@/components/ui/BadgeCelebration";

export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ subscription?: string }> }) {
  const params = await searchParams;
  const showSubscriptionSuccess = params.subscription === "success";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use service role client for RLS-sensitive queries (auth.uid() can be null in server components)
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = sk
    ? createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  const locale = await getLocale();
  let { data: profile } = await db.from("profiles").select("full_name, role, subscription_tier, total_xp, locale").eq("id", user.id).single();

  // Safety net: create missing profile if DB trigger didn't fire
  if (!profile) {
    await db.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      role: (user.user_metadata?.role as string) || "student",
      locale,
    }, { onConflict: "id" });
    const { data: refetched } = await db.from("profiles").select("full_name, role, subscription_tier, total_xp, locale").eq("id", user.id).single();
    profile = refetched;
  }

  if (profile?.role === "teacher" || profile?.role === "admin") redirect("/teacher");

  // Auto-sync locale to match the current domain
  if (profile && profile.locale !== locale) {
    await db.from("profiles").update({ locale }).eq("id", user.id);
  }
  const levels = await getLevelsWithProgress(db, user.id, locale);
  const currentLevel = levels.find((l) => l.unlocked && l.completedLessons < l.totalLessons) ?? levels[0];
  const totalCurriculumLessons = levels.reduce((s, l) => s + l.totalLessons, 0);
  const completedCurriculumLessons = levels.reduce((s, l) => s + l.completedLessons, 0);

  // Check if student completed a lesson today (passed = true, score IS NOT NULL)
  const today = new Date().toISOString().split("T")[0];
  const { data: todayProgress } = await db
    .from("student_progress")
    .select("id")
    .eq("student_id", user.id)
    .eq("passed", true)
    .not("score", "is", null)
    .gte("completed_at", today)
    .limit(1);
  const didLessonToday = (todayProgress?.length ?? 0) > 0;

  // Streak: count consecutive days with actual completed exercises
  const { data: recentProgress } = await db
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

  const { data: sessions } = await db
    .from("exercise_sessions")
    .select("id")
    .eq("student_id", user.id);

  // Find next lesson for the CTA
  const { data: allProgress } = await db
    .from("student_progress")
    .select("lesson_id, passed")
    .eq("student_id", user.id);
  const passedLessonIds = new Set((allProgress ?? []).filter((p) => p.passed).map((p) => p.lesson_id));

  // Find the first unpassed lesson across all levels/units
  let nextLessonUrl: string | null = null;
  let nextLessonTitle: string | null = null;
  const { data: allUnits } = await supabase
    .from("curriculum_units")
    .select("id, slug, level_id, sort_order, curriculum_levels!inner(slug, sort_order)")
    .eq("is_active", true)
    .eq("locale", locale);
  const sortedUnits = (allUnits ?? []).sort((a, b) => {
    const aLevel = (a.curriculum_levels as unknown as { sort_order: number }).sort_order;
    const bLevel = (b.curriculum_levels as unknown as { sort_order: number }).sort_order;
    if (aLevel !== bLevel) return aLevel - bLevel;
    return a.sort_order - b.sort_order;
  });
  const { data: allLessons } = await supabase
    .from("curriculum_lessons")
    .select("id, slug, title, unit_id, sort_order")
    .eq("is_active", true)
    .eq("locale", locale)
    .order("sort_order");

  if (sortedUnits.length > 0 && allLessons) {
    for (const unit of sortedUnits) {
      const levelSlug = (unit.curriculum_levels as unknown as { slug: string }).slug;
      const unitLessons = allLessons.filter((l) => l.unit_id === unit.id);
      for (const lesson of unitLessons) {
        if (!passedLessonIds.has(lesson.id)) {
          nextLessonUrl = `/student/curriculum/${levelSlug}/${unit.slug}/${lesson.slug}`;
          nextLessonTitle = lesson.title;
          break;
        }
      }
      if (nextLessonUrl) break;
    }
  }

  // Find what was completed today
  let todayLessonTitle: string | null = null;
  if (didLessonToday) {
    const { data: todayDetail } = await db
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

  // Locale
  const tc = await getTranslations("common");
  const { brandName, supportEmail } = await getServerLocale();

  // Badges — check for newly earned badges on every dashboard load (idempotent)
  const badges = getBadges(locale);
  let newlyEarnedBadges: string[] = [];
  if (sk) {
    newlyEarnedBadges = await checkAndAwardBadges(db, user.id, streak, locale).catch(() => [] as string[]) ?? [];
  }
  const { data: earnedBadges } = await db.from("student_badges").select("badge_slug").eq("student_id", user.id);
  const earnedBadgeSlugs = new Set((earnedBadges ?? []).map((b) => b.badge_slug));
  const earnedBadgeList = badges.filter((b) => earnedBadgeSlugs.has(b.slug));
  const celebrationBadges = newlyEarnedBadges
    .map((slug) => getBadgeBySlug(slug, locale))
    .filter(Boolean)
    .map((b) => ({ slug: b!.slug, name: b!.name, emoji: b!.emoji, image: b!.image, description: b!.description, culturalNote: b!.culturalNote }));

  const nextLessonLabel = nextLessonTitle ? getEnglishTitle(nextLessonTitle, locale) ?? nextLessonTitle : null;

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <StudentNav subscriptionTier={profile?.subscription_tier} />

        <div className="flex items-center gap-4 mb-8">
          <img src={getMascot(locale, "happy")} alt={getMascotName(locale)} width={80} height={80} className="object-contain" />
          <div>
            <h1 className="text-3xl font-bold text-brown-800">Welcome, {firstName}!</h1>
            <p className="text-brown-500">Continue your {tc("language")} learning journey.</p>
          </div>
        </div>

        {/* Continue Learning — primary CTA */}
        <section className="mb-8">
          <div className="bg-warm-white border border-brown-100 rounded-2xl p-6">
            {allComplete ? (
              <div className="text-center">
                <p className="font-semibold text-brown-800">You&apos;ve completed all available lessons!</p>
                <p className="text-sm text-brown-500 mt-1">Check back for new content, or try extra practice.</p>
                <div className="flex justify-center gap-3 mt-4">
                  <Link href="/practice" className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Extra Practice
                  </Link>
                  <Link href="/student/curriculum" className="border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors">
                    Review Curriculum
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  {nextLessonLabel && <p className="text-sm text-brown-500 mt-0.5">Next: {nextLessonLabel}</p>}
                  {streak > 0 && <p className="text-xs text-gold font-medium mt-1">{streak >= 3 ? "\uD83D\uDD25 " : ""}{streak}-day streak!</p>}
                </div>
                <Link href={nextLessonUrl ?? "/student/curriculum"} className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-sm">
                  {neverStarted ? "Start Learning" : "Continue"}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Progress — compact */}
        <section className="mb-8">
          <div className="flex items-center gap-4 bg-warm-white border border-brown-100 rounded-xl px-5 py-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm text-brown-600 mb-2">
                <span className="font-medium">{completedCurriculumLessons}/{totalCurriculumLessons} lessons</span>
                <span className="text-brown-300">&middot;</span>
                <span>{streak} day streak</span>
              </div>
              <div className="h-2 bg-brown-100 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${totalCurriculumLessons > 0 ? Math.round((completedCurriculumLessons / totalCurriculumLessons) * 100) : 0}%` }} />
              </div>
            </div>
            <Link href="/student/curriculum" className="text-sm text-gold hover:text-gold-dark font-medium shrink-0">
              Curriculum &rarr;
            </Link>
          </div>
        </section>

        {/* Badges — earned only */}
        {earnedBadgeList.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brown-800">My Badges</h2>
              <Link href="/student/profile" className="text-sm text-gold hover:text-gold-dark font-medium">View all &rarr;</Link>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-3 px-2 snap-x snap-mandatory">
              {earnedBadgeList.map((badge) => (
                <div key={badge.slug} className="flex flex-col items-center shrink-0 w-20 snap-start">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-brown-50"><img src={badge.image} alt={badge.name} width={80} height={80} className="w-full h-full object-cover" /></div>
                  <p className="text-sm font-medium mt-2 text-center leading-tight line-clamp-2 text-brown-700">{badge.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <BadgeCelebration badges={celebrationBadges} />

      <SiteFooter showFeedback />
    </div>
  );
}
