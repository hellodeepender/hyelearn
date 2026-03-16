import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import PracticeClient from "./PracticeClient";

export default async function PracticePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, grade_level, subscription_tier")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Student"}
        userRole={profile?.role ?? "student"}
      />
      <PracticeClient
        userId={user.id}
        gradeLevel={profile?.grade_level ?? 5}
        userRole={profile?.role ?? "student"}
        subscriptionTier={profile?.subscription_tier ?? "free"}
      />
    </div>
  );
}
