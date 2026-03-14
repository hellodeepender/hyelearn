import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  const { data, error } = await supabase.from("exercise_sessions").insert({
    student_id: user.id,
    subject,
    topic,
    exercise_type,
    grade_level,
    score,
    total,
    exercises_data,
  }).select().single();

  if (error) {
    console.error("[progress] Insert error:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
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
