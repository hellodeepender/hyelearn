import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import SeedClient from "./SeedClient";

export default async function SeedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  // Load curriculum tree
  const { data: levels } = await supabase
    .from("curriculum_levels")
    .select("id, slug, title, grade_value, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const { data: units } = await supabase
    .from("curriculum_units")
    .select("id, slug, title, level_id, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  const { data: lessons } = await supabase
    .from("curriculum_lessons")
    .select("id, slug, title, unit_id, lesson_type, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <SeedClient
        levels={levels ?? []}
        units={units ?? []}
        lessons={lessons ?? []}
        userId={user.id}
      />
    </div>
  );
}
