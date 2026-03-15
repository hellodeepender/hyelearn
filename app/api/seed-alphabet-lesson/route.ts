import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { callClaude } from "@/lib/claude";
import { getSystemPrompt } from "@/lib/prompts";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!process.env.SEED_API_KEY || key !== process.env.SEED_API_KEY) {
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

  // Find Armenian Alphabet Part 1 > Lesson 1
  const { data: level } = await db.from("curriculum_levels").select("id").eq("slug", "kindergarten").single();
  if (!level) return NextResponse.json({ error: "Kindergarten not found" }, { status: 404 });

  const { data: unit } = await db.from("curriculum_units").select("id").eq("level_id", level.id).eq("slug", "armenian-alphabet-1").single();
  if (!unit) return NextResponse.json({ error: "Armenian Alphabet Part 1 not found. Run migration 005 first." }, { status: 404 });

  const { data: lesson } = await db.from("curriculum_lessons").select("id").eq("unit_id", unit.id).eq("slug", "lesson-1").single();
  if (!lesson) return NextResponse.json({ error: "Lesson 1 not found" }, { status: 404 });

  await db.from("curated_exercises").delete().eq("lesson_id", lesson.id);

  const userPrompt = `Generate a Kindergarten lesson teaching the first 3 letters of the Western Armenian alphabet.

The first 3 letters are:
- Letter 1: uppercase and lowercase forms, its traditional Armenian name, its sound
- Letter 2: uppercase and lowercase forms, its name, its sound
- Letter 3: uppercase and lowercase forms, its name, its sound

For each letter, also include a simple common Western Armenian word that starts with that letter, plus an appropriate emoji for that word.

Return ONLY valid JSON (no markdown). The exercises array must contain exactly 11 items:

LEARN CARDS (sort_order 1-3): One per letter
Each learn card: { "type": "learn_card", "visual": "(emoji of example word)", "primary_text": "(UPPERCASE lowercase) - example: if the letter were A, show the uppercase and lowercase Armenian forms", "secondary_text": "(letter name) - sounds like (sound). Example: (example word in Armenian) = (English meaning)", "sort_order": 1/2/3 }

RECOGNITION (sort_order 4-6): Show the letter, pick correct name from 3 options
{ "type": "multiple_choice", "id": "4", "emoji": "", "question_hy": "(Show letter and ask 'What letter is this?' in Armenian)", "question_en": "What letter is this?", "options": [
  { "id": "a", "text_hy": "(correct letter name in Armenian)", "text_en": "(letter name)", "correct": true },
  { "id": "b", "text_hy": "(wrong letter name)", "text_en": "(name)", "correct": false },
  { "id": "c", "text_hy": "(wrong letter name)", "text_en": "(name)", "correct": false }
], "hint_hy": "", "hint_en": "(hint about the sound)", "explanation_hy": "(Armenian)", "explanation_en": "(English)", "sort_order": 4/5/6 }

SOUND MATCHING (sort_order 7-8): Which letter makes this sound?
{ "type": "multiple_choice", "id": "7", "emoji": "", "question_hy": "(Which letter makes the sound X? in Armenian)", "question_en": "Which letter makes the sound '(sound)'?", "options": [3 Armenian letters as options], "hint_hy": "", "hint_en": "(hint)", "explanation_hy": "(Armenian)", "explanation_en": "(English)", "sort_order": 7/8 }

WORD STARTS WITH (sort_order 9): Which word starts with this letter?
{ "type": "multiple_choice", "id": "9", "emoji": "(letter emoji or empty)", "question_hy": "(Which word starts with letter X? in Armenian)", "question_en": "Which word starts with this letter?", "options": [3 Armenian words], "sort_order": 9 }

MATCHING (sort_order 10): Match all 3 letters to their names
3 matching items all with sort_order 10:
{ "type": "matching", "id": "m1", "left_hy": "(letter)", "left_en": "(letter name)", "right_hy": "(letter name in Armenian)", "right_en": "(letter name)", "sort_order": 10 }

FILL BLANK (sort_order 11): The letter ___ makes the sound "ah"
{ "type": "fill_blank", "id": "11", "emoji": "", "sentence_hy": "(The letter ___ makes the sound X in Armenian)", "sentence_en": "The letter ___ makes the sound '(sound)'.", "answer_hy": "(correct letter)", "answer_en": "(letter name)", "distractors_hy": ["(wrong letter)", "(wrong letter)"], "distractors_en": ["(name)", "(name)"], "hint_hy": "", "hint_en": "(hint)", "explanation_hy": "(Armenian)", "explanation_en": "(English)", "sort_order": 11 }

CRITICAL RULES:
- Use REAL Armenian letters from the actual Armenian alphabet
- Use Western Armenian letter names and pronunciation
- Armenian script ONLY in _hy fields and primary_text
- English ONLY in _en fields and secondary_text
- Use real emoji characters for the example words
- Return: { "exercises": [...] }`;

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
    return NextResponse.json({ error: "Failed to parse", raw: rawText.slice(0, 1000) }, { status: 502 });
  }

  if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) {
    return NextResponse.json({ error: "No exercises returned" }, { status: 502 });
  }

  const inserts = parsed.exercises.map((ex) => ({
    lesson_id: lesson.id,
    exercise_type: (ex.type as string) ?? "multiple_choice",
    exercise_data: ex,
    sort_order: (ex.sort_order as number) ?? 10,
    status: "approved",
  }));

  const { error: insertErr } = await db.from("curated_exercises").insert(inserts);
  if (insertErr) {
    return NextResponse.json({ error: "Insert failed", details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, count: inserts.length, lessonId: lesson.id });
}
