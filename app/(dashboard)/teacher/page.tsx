import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";

export default async function TeacherDashboard() {
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

  // Role guard: only teachers and admins can access this page
  if (profile?.role === "student") redirect("/student");

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Teacher"}
        userRole={profile?.role ?? "teacher"}
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">
          Welcome, {profile?.full_name?.split(" ")[0] ?? "Teacher"}
        </h1>
        <p className="text-brown-500 mb-8">Manage your classes and exercises.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Active Students</h3>
            <p className="text-3xl font-bold text-gold">&mdash;</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Exercises Created</h3>
            <p className="text-3xl font-bold text-gold">&mdash;</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-6">
            <h3 className="font-semibold text-brown-800 mb-1">Avg. Completion</h3>
            <p className="text-3xl font-bold text-gold">&mdash;</p>
          </div>
        </div>
      </main>
    </div>
  );
}
