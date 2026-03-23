/**
 * Generate Bible story content for Arabic Sunday School lessons 9-72
 * using the Anthropic API. Lessons 1-8 already have full content.
 *
 * Usage: npx tsx scripts/enrich-arabic-sunday-stories.ts
 *        npx tsx scripts/enrich-arabic-sunday-stories.ts --start=9 --end=12  (subset)
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("Missing Supabase env vars"); process.exit(1); }
if (!ANTHROPIC_KEY) { console.error("Missing ANTHROPIC_API_KEY"); process.exit(1); }

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const args = process.argv.slice(2);
const startLesson = parseInt(args.find(a => a.startsWith("--start="))?.split("=")[1] ?? "9");
const endLesson = parseInt(args.find(a => a.startsWith("--end="))?.split("=")[1] ?? "72");

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface KeyPhrase {
  native: string;
  transliteration: string;
  english: string;
  audio_url?: string;
}

interface Story {
  teacher_script: string;
  key_phrases: KeyPhrase[];
}

async function generateStory(lessonNumber: number, title: string, titleNative: string, themes: string[]): Promise<Story> {
  const prompt = `You are writing a Sunday School teacher script for a Maronite Catholic Arabic-language children's program (ages 5-10).

Lesson ${lessonNumber}: "${title}" (${titleNative})
Themes: ${themes.join(", ")}

Write a teacher-readable Bible story script for this lesson. Requirements:
- 200-350 words
- Written as a teacher script: start with "Today we're going to learn about..." or similar
- Age-appropriate retelling matching the lesson title
- Simple, engaging language a teacher reads aloud to children
- Include 1-2 questions for children mid-story (e.g., "Can anyone tell me...?")
- Reference Maronite Catholic tradition where relevant
- End with a brief takeaway message

Also provide exactly 3 key vocabulary phrases in Arabic related to this lesson.

Respond in this exact JSON format (no markdown, no code fences):
{
  "teacher_script": "...",
  "key_phrases": [
    { "native": "Arabic word", "transliteration": "romanized", "english": "English meaning" },
    { "native": "Arabic word", "transliteration": "romanized", "english": "English meaning" },
    { "native": "Arabic word", "transliteration": "romanized", "english": "English meaning" }
  ]
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON — handle potential markdown wrapping
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(jsonStr);

  return {
    teacher_script: parsed.teacher_script,
    key_phrases: parsed.key_phrases.map((p: KeyPhrase) => ({
      native: p.native,
      transliteration: p.transliteration,
      english: p.english,
    })),
  };
}

async function main() {
  console.log(`\n📖 Arabic Sunday School Story Generator (lessons ${startLesson}-${endLesson})\n`);

  const { data: lessons, error } = await db
    .from("sunday_lessons")
    .select("id, lesson_number, title, title_native, liturgical_themes, story")
    .eq("locale", "ar")
    .gte("lesson_number", startLesson)
    .lte("lesson_number", endLesson)
    .order("lesson_number");

  if (error || !lessons) {
    console.error("Failed to fetch lessons:", error?.message);
    process.exit(1);
  }

  // Filter to only placeholder lessons
  const toProcess = lessons.filter(l => {
    const script = (l.story as Story | null)?.teacher_script ?? "";
    return script.includes("being prepared") || script.length < 50;
  });

  console.log(`Found ${toProcess.length} lessons needing stories\n`);

  let success = 0;
  let errors = 0;

  for (const lesson of toProcess) {
    try {
      process.stdout.write(`  Lesson ${lesson.lesson_number}: ${lesson.title}...`);

      const story = await generateStory(
        lesson.lesson_number,
        lesson.title,
        lesson.title_native ?? "",
        (lesson.liturgical_themes as string[]) ?? [],
      );

      // Preserve existing audio_url on key phrases if any
      const existingPhrases = (lesson.story as Story | null)?.key_phrases ?? [];
      for (let i = 0; i < story.key_phrases.length; i++) {
        if (existingPhrases[i]?.audio_url) {
          story.key_phrases[i].audio_url = existingPhrases[i].audio_url;
        }
      }

      const { error: updateErr } = await db
        .from("sunday_lessons")
        .update({ story })
        .eq("id", lesson.id);

      if (updateErr) {
        console.log(` ❌ DB: ${updateErr.message}`);
        errors++;
      } else {
        console.log(` ✅ (${story.teacher_script.length} chars, ${story.key_phrases.length} phrases)`);
        success++;
      }

      // Rate limit: ~1 req/sec
      await sleep(1200);
    } catch (err) {
      console.log(` ❌ ${err instanceof Error ? err.message : err}`);
      errors++;
      await sleep(2000);
    }
  }

  // Verify
  console.log("\n=== Verification ===\n");
  const { data: remaining } = await db
    .from("sunday_lessons")
    .select("lesson_number, title")
    .eq("locale", "ar")
    .or("story.is.null,story->>teacher_script.ilike.%being prepared%");

  if (remaining?.length) {
    console.log(`  ⚠️  ${remaining.length} lessons still have placeholder text:`);
    remaining.forEach(l => console.log(`    - Lesson ${l.lesson_number}: ${l.title}`));
  } else {
    console.log("  ✅ All Arabic lessons have story content");
  }

  console.log(`\n✨ Done! ${success} stories generated, ${errors} errors.\n`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
