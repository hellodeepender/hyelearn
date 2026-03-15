import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { code } = await request.json() as { code?: string };
  if (!code?.trim()) return NextResponse.json({ valid: false }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: cls } = await db
    .from("classes")
    .select("id, name, grade_level, join_code, teacher_id, max_students, profiles!classes_teacher_id_fkey(full_name)")
    .eq("join_code", code.trim().toUpperCase())
    .eq("is_active", true)
    .single();

  if (!cls) return NextResponse.json({ valid: false });

  const { count } = await db
    .from("class_memberships")
    .select("id", { count: "exact", head: true })
    .eq("class_id", cls.id)
    .eq("status", "active");

  const teacherName = (cls.profiles as unknown as { full_name: string })?.full_name ?? "Teacher";
  const gradeLabel = cls.grade_level === 0 ? "Kindergarten" : `Grade ${cls.grade_level}`;

  return NextResponse.json({
    valid: true,
    classId: cls.id,
    className: cls.name,
    teacherName,
    gradeName: gradeLabel,
    gradeLevel: cls.grade_level,
    studentCount: count ?? 0,
    maxStudents: cls.max_students,
  });
}
