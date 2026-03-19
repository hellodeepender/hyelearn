import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import StudentNav from "@/components/ui/StudentNav";
import { getUnitsWithProgress } from "@/lib/curriculum";
import { getLocale } from "@/lib/server-locale";
import MapPath from "@/components/curriculum/MapPath";

export default async function LevelPage({ params }: { params: Promise<{ levelSlug: string }> }) {
  const { levelSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role, subscription_tier").eq("id", user.id).single();
  const { data: level } = await supabase.from("curriculum_levels").select("id, slug, title, description").eq("slug", levelSlug).single();
  if (!level) notFound();

  const locale = await getLocale();
  const units = await getUnitsWithProgress(supabase, user.id, level.id, locale);

  const totalCompleted = units.reduce((s, u) => s + u.completedLessons, 0);
  const totalLessons = units.reduce((s, u) => s + u.totalLessons, 0);

  const mapNodes = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    slug: unit.slug,
    completedLessons: unit.completedLessons,
    totalLessons: unit.totalLessons,
    unlocked: unit.unlocked,
    href: `/student/curriculum/${levelSlug}/${unit.slug}`,
  }));

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Student"} userRole={profile?.role ?? "student"} />
      <StudentNav subscriptionTier={profile?.subscription_tier} />
      <MapPath
        nodes={mapNodes}
        locale={locale}
        summitLabel={`${level.title} Complete!`}
        subtitle={level.description ?? undefined}
        headerStats={`${totalCompleted}/${totalLessons} completed`}
        backHref="/student/curriculum"
        backLabel="Curriculum"
      />
    </div>
  );
}
