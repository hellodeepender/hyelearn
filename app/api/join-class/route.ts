import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { classId, studentId } = await request.json() as { classId: string; studentId?: string };
  const profileId = studentId ?? user.id;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : authClient;

  // Ensure profile exists (fallback if trigger didn't fire)
  const { data: existingProfile } = await db.from("profiles").select("id").eq("id", profileId).single();
  if (!existingProfile) {
    const meta = user.user_metadata ?? {};
    await db.from("profiles").insert({
      id: profileId,
      full_name: (meta.full_name as string) ?? (meta.name as string) ?? "",
      role: (meta.role as string) ?? "student",
    }).select().single();
  }

  // Validate class
  const { data: cls } = await db.from("classes").select("id, name, grade_level, max_students, teacher_id").eq("id", classId).eq("is_active", true).single();
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Check capacity
  const { count } = await db.from("class_memberships").select("id", { count: "exact", head: true }).eq("class_id", classId).eq("status", "active");
  if ((count ?? 0) >= cls.max_students) return NextResponse.json({ error: "Class is full" }, { status: 400 });

  // Check not already joined
  const { data: existing } = await db.from("class_memberships").select("id").eq("class_id", classId).eq("student_id", profileId).single();
  if (existing) return NextResponse.json({ error: "Already in this class" }, { status: 400 });

  // Join
  const { error: joinErr } = await db.from("class_memberships").insert({ class_id: classId, student_id: profileId });
  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 });

  // Update profile grade + tier
  const gradeLevel = cls.grade_level;
  const { data: level } = await db.from("curriculum_levels").select("id").eq("grade_value", gradeLevel === 0 ? "K" : String(gradeLevel)).single();

  await db.from("profiles").update({
    grade_level_id: level?.id ?? null,
    grade_level: gradeLevel,
    subscription_tier: "school",
  }).eq("id", profileId);

  // Get teacher name
  const { data: teacher } = await db.from("profiles").select("full_name").eq("id", cls.teacher_id).single();

  return NextResponse.json({
    success: true,
    className: cls.name,
    teacherName: teacher?.full_name ?? "Teacher",
    gradeName: gradeLevel === 0 ? "Kindergarten" : `Grade ${gradeLevel}`,
  });
}
