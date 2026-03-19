import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createDbClient } from "@supabase/supabase-js";
import { callClaude } from "@/lib/claude";
import { getSystemPrompt, buildUserPrompt } from "@/lib/prompts";
import { canUseAIPractice, trackAIUsage } from "@/lib/access";
import type { ExerciseType } from "@/lib/types";

const VALID_TYPES: ExerciseType[] = ["multiple_choice", "fill_blank", "matching", "true_false"];

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check AI usage limits
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createDbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  const access = await canUseAIPractice(db, user.id);
  if (!access.allowed) {
    return NextResponse.json({
      error: "You've used all 5 practice sessions for today. Come back tomorrow!",
      remaining: 0,
    }, { status: 403 });
  }

  // Parse and validate request
  let body: { grade?: string | number; subject?: string; topic?: string; exerciseType?: string; count?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { grade: rawGrade, subject, topic, exerciseType, count: rawCount } = body;
  const grade = String(rawGrade);
  const validGrades = ["K", "1", "2", "3", "4", "5"];

  if (!grade || !validGrades.includes(grade)) {
    return NextResponse.json({ error: "grade must be K or a number between 1 and 5" }, { status: 400 });
  }
  if (!subject || typeof subject !== "string") {
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  }
  if (!topic || typeof topic !== "string") {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }
  if (!exerciseType || !VALID_TYPES.includes(exerciseType as ExerciseType)) {
    return NextResponse.json({ error: `exerciseType must be one of: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }

  const count = Math.min(Math.max(rawCount ?? 4, 1), 10);

  // Build prompts and call Claude
  const systemPrompt = getSystemPrompt();
  const userPrompt = buildUserPrompt(grade, subject.trim(), topic.trim(), exerciseType as ExerciseType, count);

  let rawText: string;
  try {
    rawText = await callClaude(systemPrompt, userPrompt);
  } catch (err) {
    console.error("[generate] Claude API error:", err);
    return NextResponse.json({ error: "Failed to generate exercises" }, { status: 502 });
  }

  // Parse JSON — strip markdown fences if Claude added them
  let parsed: { exercises: unknown[]; topic_title_hy?: string; topic_title_en?: string };
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[generate] Failed to parse Claude response:", rawText.slice(0, 500));
    return NextResponse.json({ error: "AI returned invalid format. Please try again." }, { status: 502 });
  }

  if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    return NextResponse.json({ error: "AI returned no exercises. Please try again." }, { status: 502 });
  }

  // Track AI usage
  await trackAIUsage(db, user.id).catch(() => {});

  return NextResponse.json({
    exercises: parsed.exercises,
    topic_title_hy: parsed.topic_title_hy ?? "",
    topic_title_en: parsed.topic_title_en ?? topic,
  });
}
