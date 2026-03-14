import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";

export default async function PracticePage() {
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

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Student"}
        userRole={profile?.role ?? "student"}
      />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">Practice</h1>
        <p className="text-brown-500 mb-8">
          Exercises will appear here once your teacher assigns them.
        </p>
        <div className="bg-warm-white border border-brown-200 border-dashed rounded-2xl p-12 text-center">
          <p className="text-brown-400 text-lg">No exercises available yet.</p>
          <p className="text-brown-300 text-sm mt-2">Check back soon!</p>
        </div>
      </main>
    </div>
  );
}
