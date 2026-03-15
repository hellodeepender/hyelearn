import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { generateLessonContent } from "@/lib/lesson-templates";
import { validateLesson } from "@/lib/content-validator";

export async function POST(request: NextRequest) {
  // Auth: SEED_API_KEY or authenticated teacher
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();

  const body = await request.json() as { lesson_id: string; key?: string };
  const { lesson_id, key } = body;

  const isKeyAuth = process.env.SEED_API_KEY && key === process.env.SEED_API_KEY;
  if (!isKeyAuth && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isKeyAuth && user) {
    const { data: profile } = await authClient.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "teacher" && profile?.role !== "admin") {
      return NextResponse.json({ error: "Teachers only" }, { status: 403 });
    }
  }

  if (!lesson_id) {
    return NextResponse.json({ error: "lesson_id required" }, { status: 400 });
  }

  // DB client
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : authClient;

  // Fetch lesson and template type
  const { data: lesson, error: lessonErr } = await db
    .from("curriculum_lessons")
    .select("id, template_type, unit_id")
    .eq("id", lesson_id)
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const templateType = lesson.template_type ?? "vocabulary";

  // Fetch content items
  const { data: items } = await db
    .from("content_items")
    .select("id, item_type, sort_order, item_data")
    .eq("lesson_id", lesson_id)
    .order("sort_order");

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No content items found for this lesson" }, { status: 400 });
  }

  // Generate exercises from template
  const generated = generateLessonContent(templateType, items);

  // Validate
  const validation = validateLesson(items, generated, templateType);
  if (!validation.valid) {
    console.error("[generate-lesson] Validation errors:", validation.errors);
  }

  // Delete existing exercises
  await db.from("curated_exercises").delete().eq("lesson_id", lesson_id);

  // Insert generated exercises
  const inserts = generated.map((ex) => ({
    lesson_id,
    exercise_type: ex.exercise_type,
    exercise_data: ex.exercise_data,
    sort_order: ex.sort_order,
    status: "approved",
    created_by: user?.id ?? null,
  }));

  const { error: insertErr } = await db.from("curated_exercises").insert(inserts);
  if (insertErr) {
    return NextResponse.json({ error: "Insert failed", details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    count: generated.length,
    learnCards: generated.filter((e) => e.exercise_type === "learn_card").length,
    exercises: generated.filter((e) => e.exercise_type !== "learn_card").length,
    validation,
  });
}
