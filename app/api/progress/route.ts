import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("[progress] Auth failed:", authError?.message);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    subject: string;
    topic: string;
    exercise_type: string;
    grade_level: number;
    score: number;
    total: number;
    exercises_data: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subject, topic, exercise_type, grade_level, score, total, exercises_data } = body;
  console.log("[progress] Saving for user:", user.id, { subject, topic, exercise_type, score, total });

  // Use admin client to bypass RLS
  const admin = createAdminClient();

  const { data, error } = await admin.from("exercise_sessions").insert({
    student_id: user.id,
    subject,
    topic,
    exercise_type,
    grade_level,
    score,
    total,
    exercises_data,
  }).select("id").single();

  if (error) {
    console.error("[progress] Insert error:", error.message, error.details, error.hint);
    return NextResponse.json({ error: "Failed to save progress", details: error.message }, { status: 500 });
  }

  console.log("[progress] Saved session:", data.id);
  return NextResponse.json({ session: data });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client for reliable reads
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("exercise_sessions")
    .select("*")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[progress] Query error:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
