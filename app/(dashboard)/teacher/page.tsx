import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/ui/Header";
import CreateClassForm from "./CreateClassForm";

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

  if (profile?.role === "student") redirect("/student");

  // Fetch teacher's classes with student counts
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade_level, join_code, created_at, class_students(count)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const allClasses = classes ?? [];

  // Count total students across all classes
  const totalStudents = allClasses.reduce((sum, c) => {
    const countArr = c.class_students as unknown as { count: number }[];
    return sum + (countArr?.[0]?.count ?? 0);
  }, 0);

  // Get student IDs in teacher's classes for session stats
  const { data: classStudentRows } = await supabase
    .from("class_students")
    .select("student_id")
    .in("class_id", allClasses.map((c) => c.id));

  const studentIds = classStudentRows?.map((r) => r.student_id) ?? [];

  // Fetch total exercise sessions for those students
  let totalSessions = 0;
  if (studentIds.length > 0) {
    const { count } = await supabase
      .from("exercise_sessions")
      .select("id", { count: "exact", head: true })
      .in("student_id", studentIds);
    totalSessions = count ?? 0;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Teacher";

  return (
    <div className="min-h-screen bg-cream">
      <Header
        userName={profile?.full_name ?? "Teacher"}
        userRole={profile?.role ?? "teacher"}
      />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">
          Welcome, {firstName}!
        </h1>
        <p className="text-brown-500 mb-8">Manage your classes and track student progress.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Classes</h3>
            <p className="text-3xl font-bold text-gold">{allClasses.length}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Total Students</h3>
            <p className="text-3xl font-bold text-gold">{totalStudents}</p>
          </div>
          <div className="bg-warm-white border border-brown-100 rounded-xl p-5">
            <h3 className="text-sm font-medium text-brown-500 mb-1">Student Sessions</h3>
            <p className="text-3xl font-bold text-gold">{totalSessions}</p>
          </div>
        </div>

        {/* Create class + class list */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-brown-800 mb-4">Create a Class</h2>
            <CreateClassForm />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-brown-800 mb-4">Your Classes</h2>
            {allClasses.length > 0 ? (
              <div className="space-y-3">
                {allClasses.map((c) => {
                  const countArr = c.class_students as unknown as { count: number }[];
                  const studentCount = countArr?.[0]?.count ?? 0;
                  return (
                    <div
                      key={c.id}
                      className="bg-warm-white border border-brown-100 rounded-xl p-5 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-brown-800">{c.name}</p>
                        <p className="text-sm text-brown-400">
                          Grade {c.grade_level} &middot; {studentCount} student{studentCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono bg-brown-50 border border-brown-200 px-3 py-1 rounded-lg text-brown-700">
                          {c.join_code}
                        </p>
                        <p className="text-xs text-brown-400 mt-1">Join code</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-warm-white border border-brown-200 border-dashed rounded-xl p-8 text-center">
                <p className="text-brown-400">No classes yet.</p>
                <p className="text-brown-300 text-sm mt-1">Create your first class to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview exercises link */}
        <div className="mt-10 pt-8 border-t border-brown-100">
          <Link
            href="/practice"
            className="inline-block border-2 border-brown-200 hover:border-brown-300 text-brown-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Preview Exercises
          </Link>
        </div>
      </main>
    </div>
  );
}
