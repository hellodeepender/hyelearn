import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getLocale } from "@/lib/server-locale";
import Header from "@/components/ui/Header";
import CreateClassForm from "./CreateClassForm";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use service role client for RLS-sensitive queries (auth.uid() can be null in server components)
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = sk
    ? createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  const locale = await getLocale();
  let { data: profile } = await db.from("profiles").select("full_name, role, locale").eq("id", user.id).single();

  // Safety net: create missing profile if DB trigger didn't fire
  if (!profile) {
    await db.from("profiles").upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      role: (user.user_metadata?.role as string) || "student",
      locale,
    }, { onConflict: "id" });
    const { data: refetched } = await db.from("profiles").select("full_name, role, locale").eq("id", user.id).single();
    profile = refetched;
  }

  if (profile?.role === "student") redirect("/student");

  // Auto-sync locale to match the current domain
  if (profile && profile.locale !== locale) {
    await db.from("profiles").update({ locale }).eq("id", user.id);
  }

  // Classes
  const { data: classes } = await db
    .from("classes")
    .select("id, name, grade_level, join_code, class_students(count)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });
  const allClasses = classes ?? [];
  const totalStudents = allClasses.reduce((sum, c) => {
    const countArr = c.class_students as unknown as { count: number }[];
    return sum + (countArr?.[0]?.count ?? 0);
  }, 0);

  // Count distinct lessons with at least 1 approved exercise
  const { data: readyLessonRows } = await db
    .from("curated_exercises")
    .select("lesson_id")
    .eq("status", "approved");
  const readyLessons = new Set((readyLessonRows ?? []).map((r) => r.lesson_id)).size;

  // Curriculum levels with stats — teachers see only their locale, admins see all
  const isAdmin = profile?.role === "admin";
  let levelsQuery = db.from("curriculum_levels").select("id, slug, title, sort_order").eq("is_active", true).order("sort_order");
  let unitsQuery = db.from("curriculum_units").select("id, level_id").eq("is_active", true);
  let lessonsQuery = db.from("curriculum_lessons").select("id, unit_id").eq("is_active", true);
  if (!isAdmin) {
    levelsQuery = levelsQuery.eq("locale", locale);
    unitsQuery = unitsQuery.eq("locale", locale);
    lessonsQuery = lessonsQuery.eq("locale", locale);
  }
  const { data: levels } = await levelsQuery;
  const { data: allUnits } = await unitsQuery;
  const { data: allLessons } = await lessonsQuery;
  const { data: allExercises } = await db.from("curated_exercises").select("lesson_id, status");

  const levelStats = (levels ?? []).map((level) => {
    const unitIds = (allUnits ?? []).filter((u) => u.level_id === level.id).map((u) => u.id);
    const lessonIds = (allLessons ?? []).filter((l) => unitIds.includes(l.unit_id)).map((l) => l.id);
    const exForLevel = (allExercises ?? []).filter((e) => lessonIds.includes(e.lesson_id));
    const approvedLessonIds = new Set(exForLevel.filter((e) => e.status === "approved").map((e) => e.lesson_id));
    return {
      ...level,
      units: unitIds.length,
      lessons: lessonIds.length,
      lessonsReady: approvedLessonIds.size,
      hasContent: exForLevel.length > 0,
    };
  });

  const activeLevels = levelStats.filter((l) => l.hasContent || l.units > 0);
  const emptyLevels = levelStats.filter((l) => !l.hasContent && l.units === 0);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Teacher";

  return (
    <div className="min-h-screen bg-cream">
      <Header userName={profile?.full_name ?? "Teacher"} userRole={profile?.role ?? "teacher"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-brown-800 mb-1">Welcome, {firstName}!</h1>
        <p className="text-brown-500 mb-8">Manage your curriculum and classes</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Classes</h3>
            <p className="text-3xl font-bold text-gold">{allClasses.length}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Students</h3>
            <p className="text-3xl font-bold text-gold">{totalStudents}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Lessons Ready</h3>
            <p className="text-3xl font-bold text-green-600">{readyLessons}</p>
          </div>
        </div>

        {/* Curriculum */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brown-800">Curriculum</h2>
            <div className="flex gap-2">
              <Link href="/teacher/content" className="bg-gold hover:bg-gold-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Content Editor
              </Link>
              {isAdmin && (
                <Link href="/teacher/bulk-generate" className="border border-brown-200 hover:border-brown-300 text-brown-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Bulk Generate
                </Link>
              )}
            </div>
          </div>

          <div className="bg-warm-white border border-brown-100 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-brown-50/50 border-b border-brown-100 text-xs font-medium text-brown-500 uppercase">
              <span className="col-span-2">Level</span>
              <span>Units</span>
              <span>Lessons Ready</span>
            </div>
            {activeLevels.map((level) => (
              <div key={level.id} className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-brown-50 items-center">
                <div className="col-span-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    level.lessonsReady > 0 ? "bg-green-500" : "bg-brown-200"
                  }`} />
                  <span className="font-medium text-brown-800 text-sm">{level.title}</span>
                </div>
                <span className="text-sm text-brown-600">{level.units}</span>
                <span className="text-sm text-green-600 font-medium">{level.lessonsReady}/{level.lessons}</span>
              </div>
            ))}
            {emptyLevels.length > 0 && (
              <div className="px-5 py-3 text-xs text-brown-400">
                {emptyLevels.map((l) => l.title).join(", ")}: Coming Soon
              </div>
            )}
          </div>
        </section>

        {/* Sunday School */}
        <section className="mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brown-800">Sunday School</h2>
            <Link href="/sunday-school" className="border border-brown-200 hover:border-brown-300 text-brown-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View Lessons
            </Link>
          </div>
        </section>

        {/* Class management */}
        <section>
          <h2 className="text-lg font-semibold text-brown-800 mb-4">Classes</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CreateClassForm />
            </div>
            <div className="lg:col-span-2">
              {allClasses.length > 0 ? (
                <div className="space-y-3">
                  {allClasses.map((c) => {
                    const countArr = c.class_students as unknown as { count: number }[];
                    const studentCount = countArr?.[0]?.count ?? 0;
                    const gradeLabel = c.grade_level === 0 ? "Kindergarten" : `Grade ${c.grade_level}`;
                    return (
                      <Link key={c.id} href={`/teacher/class/${c.id}`} className="block bg-warm-white border border-brown-100 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-medium text-brown-800">{c.name}</p>
                          <p className="text-sm text-brown-400">{gradeLabel} &middot; {studentCount} student{studentCount !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono bg-brown-50 border border-brown-200 px-3 py-1 rounded-lg text-brown-700">{c.join_code}</p>
                          <p className="text-xs text-brown-400 mt-1">View class &rarr;</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
                  <p className="text-brown-400">No classes yet. Create your first class to get started.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
