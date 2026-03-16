import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import { getProgressToNextLevel, ARARAT_LEVELS } from "@/lib/xp";
import { BADGES } from "@/lib/badges";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, total_xp")
    .eq("id", user.id)
    .single();

  const { data: earnedBadges } = await supabase
    .from("student_badges")
    .select("badge_slug, earned_at")
    .eq("student_id", user.id);

  const earnedMap = new Map((earnedBadges ?? []).map((b) => [b.badge_slug, b.earned_at]));
  const totalXP = profile?.total_xp ?? 0;
  const progress = getProgressToNextLevel(totalXP);

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <Link href="/student" className="text-sm text-brown-400 hover:text-brown-600 mb-4 inline-block">&larr; Dashboard</Link>

        {/* Name & level */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brown-800">{profile?.full_name ?? "Student"}</h1>
          <p className="text-brown-400 text-sm mt-1">Armenian learner</p>
        </div>

        {/* Ararat climb */}
        <div className="bg-warm-white border border-brown-100 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-brown-800 mb-4">Climb Ararat {"\uD83C\uDFD4\uFE0F"}</h2>
          <div className="flex flex-col gap-1">
            {[...ARARAT_LEVELS].reverse().map((level) => {
              const isActive = progress.current.level === level.level;
              const isReached = totalXP >= level.minXP;
              return (
                <div key={level.level} className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isActive ? "bg-gold/10 border border-gold/30" : ""}`}>
                  <span className={`text-xl ${isReached ? "" : "opacity-30"}`}>{level.emoji}</span>
                  <span className={`font-medium text-sm ${isActive ? "text-gold-dark" : isReached ? "text-brown-700" : "text-brown-300"}`}>
                    {level.name}
                  </span>
                  <span className="text-xs text-brown-400 ml-auto">{level.minXP}+ XP</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-brown-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress.percentage}%` }} />
            </div>
            <p className="text-sm text-brown-500 mt-2 text-center font-medium">{totalXP} XP total</p>
            {progress.next && (
              <p className="text-xs text-brown-400 text-center">{progress.next.minXP - totalXP} XP to {progress.next.name}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <h2 className="text-lg font-semibold text-brown-800 mb-4">Badges</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const earnedAt = earnedMap.get(badge.slug);
            const isEarned = !!earnedAt;
            return (
              <div key={badge.slug} className={`bg-warm-white border rounded-xl p-5 text-center flex flex-col items-center ${isEarned ? "border-gold/30" : "border-brown-100"}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 ${isEarned ? "bg-gold/10 border-2 border-gold/30 shadow-sm" : "bg-brown-50 border-2 border-brown-100"}`}>
                  {isEarned ? badge.emoji : "\uD83D\uDD12"}
                </div>
                <p className={`font-medium text-sm ${isEarned ? "text-brown-800" : "text-brown-300"}`}>{badge.name}</p>
                <p className="text-xs text-brown-400 mt-0.5">{badge.description}</p>
                {isEarned && earnedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    {new Date(earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
