import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import ContentClient from "./ContentClient";

export default async function ContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  const { data: levels } = await supabase.from("curriculum_levels").select("id, slug, title, sort_order").eq("is_active", true).order("sort_order");
  const { data: units } = await supabase.from("curriculum_units").select("id, slug, title, level_id, sort_order").eq("is_active", true).order("sort_order");
  const { data: lessons } = await supabase.from("curriculum_lessons").select("id, slug, title, unit_id, template_type, sort_order").eq("is_active", true).order("sort_order");

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <ContentClient
        levels={levels ?? []}
        units={units ?? []}
        lessons={lessons ?? []}
        userId={user.id}
      />
    </div>
  );
}
