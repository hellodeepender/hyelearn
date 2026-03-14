import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

function getDb(authClient: Awaited<ReturnType<typeof createServerClient>>) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return authClient;
}

export async function POST(request: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message }, { status: 401 });
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
  console.log("[progress] user:", user.id, { subject, topic, exercise_type, score, total });

  const db = getDb(authClient);

  const { data, error } = await db.from("exercise_sessions").insert({
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
    console.error("[progress] Insert error:", error.message, error.details, error.hint, error.code);
    return NextResponse.json({
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    }, { status: 500 });
  }

  console.log("[progress] Saved session:", data.id);
  return NextResponse.json({ session: data });
}

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb(authClient);

  const { data, error } = await db
    .from("exercise_sessions")
    .select("*")
    .eq("student_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[progress] Query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
