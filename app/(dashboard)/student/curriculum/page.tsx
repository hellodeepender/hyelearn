import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import { getLevelsWithProgress } from "@/lib/curriculum";
import { getLocale } from "@/lib/server-locale";
import MapPath from "@/components/curriculum/MapPath";

export default async function CurriculumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, subscription_tier")
    .eq("id", user.id)
    .single();

  const locale = await getLocale();
  const levels = await getLevelsWithProgress(supabase, user.id, locale);

  const totalCompleted = levels.reduce((s, l) => s + l.completedLessons, 0);
  const totalLessons = levels.reduce((s, l) => s + l.totalLessons, 0);

  const mapNodes = levels.map((level) => ({
    id: level.id,
    title: level.title,
    slug: level.slug,
    completedLessons: level.completedLessons,
    totalLessons: level.totalLessons,
    unlocked: level.unlocked,
    href: `/student/curriculum/${level.slug}`,
  }));

  const summitLabel = locale === "el" ? "Mount Olympus" : "Mount Ararat";

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <StudentNav subscriptionTier={profile?.subscription_tier} />
      <MapPath
        nodes={mapNodes}
        locale={locale}
        summitLabel={summitLabel}
        subtitle="All Grades"
        headerStats={`${totalCompleted}/${totalLessons} completed`}
        backHref="/student"
        backLabel="Dashboard"
      />
    </div>
  );
}
