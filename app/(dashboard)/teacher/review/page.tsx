import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import Header from "@/components/ui/Header";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = sk ? createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } }) : supabase;

  const { data: profile } = await db.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (profile?.role === "student") redirect("/student");

  const { data: draftExercises } = await db
    .from("curated_exercises")
    .select("id, exercise_type, exercise_data, sort_order, status, created_at, curriculum_lessons!inner(title, curriculum_units!inner(title))")
    .eq("status", "draft")
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-brown-800">Review Exercises</h1>
            <p className="text-brown-500 text-sm mt-1">
              {draftExercises?.length ?? 0} exercise{(draftExercises?.length ?? 0) !== 1 ? "s" : ""} pending review
            </p>
          </div>
          <a href="/teacher" className="text-sm text-brown-500 hover:text-brown-700 border border-brown-200 hover:border-brown-300 px-3 py-1.5 rounded-lg">
            Dashboard
          </a>
        </div>

        {(!draftExercises || draftExercises.length === 0) ? (
          <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
            <p className="text-brown-400">No exercises pending review.</p>
            <p className="text-brown-300 text-sm mt-1">Generate exercises from the seed page to get started.</p>
          </div>
        ) : (
          <ReviewClient exercises={draftExercises.map((e) => ({
            id: e.id,
            type: e.exercise_type,
            data: e.exercise_data as Record<string, unknown>,
            lessonTitle: (e.curriculum_lessons as unknown as { title: string }).title,
            unitTitle: ((e.curriculum_lessons as unknown as { curriculum_units: { title: string } }).curriculum_units).title,
          }))} />
        )}
      </main>
    </div>
  );
}
