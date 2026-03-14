import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callClaude } from "@/lib/claude";
import { getSystemPrompt } from "@/lib/prompts";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== "hyelearn2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 });
  }

  const db = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Find Kindergarten > Alphabet Part 1 > Lesson 1
  const { data: level } = await db
    .from("curriculum_levels")
    .select("id")
    .eq("slug", "kindergarten")
    .single();

  if (!level) return NextResponse.json({ error: "Kindergarten level not found" }, { status: 404 });

  const { data: unit } = await db
    .from("curriculum_units")
    .select("id")
    .eq("level_id", level.id)
    .eq("slug", "alphabet-1")
    .single();

  if (!unit) return NextResponse.json({ error: "Alphabet Part 1 unit not found" }, { status: 404 });

  const { data: lesson } = await db
    .from("curriculum_lessons")
    .select("id")
    .eq("unit_id", unit.id)
    .eq("slug", "lesson-1")
    .single();

  if (!lesson) return NextResponse.json({ error: "Lesson 1 not found" }, { status: 404 });

  // Delete existing exercises
  await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

  // Generate with Claude
  const userPrompt = `Generate a perfect first lesson for Kindergarten Western Armenian. Teach 3 simple words: apple, cat, book.

Return ONLY valid JSON with no markdown:
{
  "exercises": [
    {"type":"learn_card","visual":"(apple emoji)","primary_text":"Armenian word for apple in Armenian script","secondary_text":"Apple","sort_order":1},
    {"type":"learn_card","visual":"(cat emoji)","primary_text":"Armenian word for cat in Armenian script","secondary_text":"Cat","sort_order":2},
    {"type":"learn_card","visual":"(book emoji)","primary_text":"Armenian word for book in Armenian script","secondary_text":"Book","sort_order":3},
    {"type":"multiple_choice","id":"1","emoji":"(apple emoji)","question_hy":"What is this? in Armenian script","question_en":"What is this?","options":[{"id":"a","text_hy":"apple in Armenian","text_en":"Apple","correct":true},{"id":"b","text_hy":"cat in Armenian","text_en":"Cat","correct":false},{"id":"c","text_hy":"book in Armenian","text_en":"Book","correct":false}],"hint_hy":"","hint_en":"This is a fruit","explanation_hy":"explanation in Armenian","explanation_en":"An apple is a fruit.","sort_order":10},
    {"type":"multiple_choice","id":"2","emoji":"(cat emoji)","question_hy":"What is this? in Armenian script","question_en":"What is this?","options":[{"id":"a","text_hy":"book in Armenian","text_en":"Book","correct":false},{"id":"b","text_hy":"cat in Armenian","text_en":"Cat","correct":true},{"id":"c","text_hy":"apple in Armenian","text_en":"Apple","correct":false}],"hint_hy":"","hint_en":"This is an animal","explanation_hy":"explanation in Armenian","explanation_en":"A cat is an animal.","sort_order":11},
    {"type":"multiple_choice","id":"3","emoji":"(book emoji)","question_hy":"What is this? in Armenian script","question_en":"What is this?","options":[{"id":"a","text_hy":"cat in Armenian","text_en":"Cat","correct":false},{"id":"b","text_hy":"apple in Armenian","text_en":"Apple","correct":false},{"id":"c","text_hy":"book in Armenian","text_en":"Book","correct":true}],"hint_hy":"","hint_en":"You read this","explanation_hy":"explanation in Armenian","explanation_en":"A book is for reading.","sort_order":12},
    {"type":"fill_blank","id":"4","emoji":"(apple emoji)","sentence_hy":"The ___ is red in Armenian","sentence_en":"The ___ is red.","answer_hy":"apple in Armenian","answer_en":"Apple","answer_emoji":"(apple emoji)","distractors_hy":["cat in Armenian","book in Armenian"],"distractors_en":["Cat","Book"],"distractors_emoji":["(cat emoji)","(book emoji)"],"hint_hy":"","hint_en":"A red fruit","explanation_hy":"explanation in Armenian","explanation_en":"The apple is red.","sort_order":13}
  ]
}

Replace every placeholder in parentheses with the ACTUAL content:
- Use real emoji characters (not text descriptions)
- Use Western Armenian with classical orthography for all Armenian fields
- Armenian script ONLY in _hy and primary_text fields
- English ONLY in _en and secondary_text fields`;

  let rawText: string;
  try {
    rawText = await callClaude(getSystemPrompt(), userPrompt);
  } catch (err) {
    return NextResponse.json({ error: "Claude API failed", details: String(err) }, { status: 502 });
  }

  let parsed: { exercises: Record<string, unknown>[] };
  try {
    const cleaned = rawText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```$/i, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ error: "Failed to parse Claude response", raw: rawText.slice(0, 500) }, { status: 502 });
  }

  if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    return NextResponse.json({ error: "No exercises returned" }, { status: 502 });
  }

  // Insert as approved exercises
  const inserts = parsed.exercises.map((ex) => {
    const exType = (ex.type as string) ?? "multiple_choice";
    const sortOrder = (ex.sort_order as number) ?? 10;
    return {
      lesson_id: lesson.id,
      exercise_type: exType,
      exercise_data: ex,
      sort_order: sortOrder,
      status: "approved",
    };
  });

  const { error: insertErr } = await db.from("curated_exercises").insert(inserts);
  if (insertErr) {
    return NextResponse.json({ error: "Insert failed", details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: inserts.length, lessonId: lesson.id });
}
