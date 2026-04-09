/**
 * Batch-generate TTS audio for all Sunday School lessons.
 *
 * Usage: npx tsx scripts/generate-sunday-school-audio.ts
 *        npx tsx scripts/generate-sunday-school-audio.ts --lesson=1 --locale=hy  (test single)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const NARAKEET_KEY = process.env.NARAKEET_API_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!NARAKEET_KEY) {
  console.error("Missing NARAKEET_API_KEY in .env.local. Add it and re-run.");
  console.error("Get a key at https://www.narakeet.com/");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const VOICE_MAP: Record<string, string> = { hy: "nune", el: "eleni", ar: "majida", tl: "bianca" };
const DELAY_MS = 600; // ms between API calls
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Parse args
const args = process.argv.slice(2);
const singleLesson = args.find((a) => a.startsWith("--lesson="))?.split("=")[1];
const singleLocale = args.find((a) => a.startsWith("--locale="))?.split("=")[1];

let generated = 0;
let skipped = 0;
let errors = 0;

async function fileExists(path: string): Promise<boolean> {
  const { data } = await db.storage.from("audio").download(path);
  return !!data;
}

async function generateAndUpload(text: string, storagePath: string, voice: string): Promise<string | null> {
  if (!text || text.trim().length === 0) return null;

  // Check if already exists
  if (await fileExists(storagePath)) {
    skipped++;
    return `${SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
  }

  try {
    const res = await fetch(`https://api.narakeet.com/text-to-speech/mp3?voice=${voice}`, {
      method: "POST",
      headers: {
        "x-api-key": NARAKEET_KEY,
        "Content-Type": "text/plain",
        "accept": "application/octet-stream",
      },
      body: text.trim(),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`    [ERROR] Narakeet ${res.status}: ${errBody.slice(0, 100)}`);
      errors++;
      return null;
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    if (audioBuffer.length < 500) {
      console.error(`    [ERROR] Audio too small (${audioBuffer.length} bytes) for: ${text.slice(0, 40)}`);
      errors++;
      return null;
    }

    const { error: uploadErr } = await db.storage.from("audio").upload(storagePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });

    if (uploadErr) {
      console.error(`    [ERROR] Upload: ${uploadErr.message}`);
      errors++;
      return null;
    }

    generated++;
    const url = `${SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
    return url;
  } catch (err) {
    console.error(`    [ERROR] ${err instanceof Error ? err.message : err}`);
    errors++;
    return null;
  }
}

interface KeyPhrase { native?: string; transliteration?: string; english?: string; audio_url?: string }
interface VocabWord { word_native?: string; word_transliteration?: string; word_english?: string; usage_example?: string; audio_url?: string }
interface Opening { prayer_native?: string; prayer_transliteration?: string; prayer_english?: string; instructions?: string; audio_url?: string }
interface Closing { prayer_native?: string; prayer_transliteration?: string; prayer_english?: string; audio_url?: string }
interface Story { teacher_script?: string; key_phrases?: KeyPhrase[] }

async function processLesson(lesson: {
  id: string;
  locale: string;
  lesson_number: number;
  title: string;
  opening: Opening | null;
  story: Story | null;
  vocabulary: VocabWord[] | null;
  closing: Closing | null;
}) {
  const { locale, lesson_number } = lesson;
  const voice = VOICE_MAP[locale] ?? "nune";
  const prefix = `sunday-school/${locale}/lesson-${lesson_number}`;

  let audioCount = 0;
  const totalItems: string[] = [];

  // Count expected items
  if (lesson.opening?.prayer_native) totalItems.push("opening");
  if (lesson.story?.key_phrases) lesson.story.key_phrases.forEach((_, i) => totalItems.push(`kp-${i}`));
  if (lesson.vocabulary) lesson.vocabulary.forEach((_, i) => totalItems.push(`vocab-${i}`));
  if (lesson.closing?.prayer_native) totalItems.push("closing");

  console.log(`  [${locale}] Lesson ${lesson_number}: ${lesson.title} — ${totalItems.length} audio items`);

  // 1. Opening prayer
  let updatedOpening = lesson.opening ? { ...lesson.opening } : null;
  if (updatedOpening?.prayer_native) {
    const url = await generateAndUpload(updatedOpening.prayer_native, `${prefix}/opening-prayer.mp3`, voice);
    if (url) { updatedOpening.audio_url = url; audioCount++; }
    await sleep(DELAY_MS);
  }

  // 2. Key phrases
  let updatedStory = lesson.story ? { ...lesson.story } : null;
  if (updatedStory?.key_phrases) {
    const updatedPhrases: KeyPhrase[] = [];
    for (let i = 0; i < updatedStory.key_phrases.length; i++) {
      const phrase = { ...updatedStory.key_phrases[i] };
      if (phrase.native) {
        const url = await generateAndUpload(phrase.native, `${prefix}/key-phrase-${i}.mp3`, voice);
        if (url) { phrase.audio_url = url; audioCount++; }
        await sleep(DELAY_MS);
      }
      updatedPhrases.push(phrase);
    }
    updatedStory = { ...updatedStory, key_phrases: updatedPhrases };
  }

  // 3. Vocabulary
  let updatedVocab: VocabWord[] | null = null;
  if (lesson.vocabulary && lesson.vocabulary.length > 0) {
    updatedVocab = [];
    for (let i = 0; i < lesson.vocabulary.length; i++) {
      const word = { ...lesson.vocabulary[i] };
      if (word.word_native) {
        const url = await generateAndUpload(word.word_native, `${prefix}/vocab-${i}.mp3`, voice);
        if (url) { word.audio_url = url; audioCount++; }
        await sleep(DELAY_MS);
      }
      updatedVocab.push(word);
    }
  }

  // 4. Closing prayer
  let updatedClosing = lesson.closing ? { ...lesson.closing } : null;
  if (updatedClosing?.prayer_native) {
    const url = await generateAndUpload(updatedClosing.prayer_native, `${prefix}/closing-prayer.mp3`, voice);
    if (url) { updatedClosing.audio_url = url; audioCount++; }
    await sleep(DELAY_MS);
  }

  // Update the lesson record
  const updateData: Record<string, unknown> = {};
  if (updatedOpening) updateData.opening = updatedOpening;
  if (updatedStory) updateData.story = updatedStory;
  if (updatedVocab) updateData.vocabulary = updatedVocab;
  if (updatedClosing) updateData.closing = updatedClosing;

  if (Object.keys(updateData).length > 0) {
    const { error } = await db.from("sunday_lessons").update(updateData).eq("id", lesson.id);
    if (error) {
      console.error(`    [ERROR] DB update: ${error.message}`);
    }
  }

  console.log(`    -> ${audioCount} audio files processed`);
}

async function main() {
  console.log("\n\uD83D\uDD0A Sunday School Audio Generator\n");

  // Build query
  let query = db
    .from("sunday_lessons")
    .select("id, locale, lesson_number, title, opening, story, vocabulary, closing")
    .order("locale")
    .order("lesson_number");

  if (singleLesson) query = query.eq("lesson_number", parseInt(singleLesson));
  if (singleLocale) query = query.eq("locale", singleLocale);

  const { data: lessons, error } = await query;
  if (error || !lessons) {
    console.error("Failed to fetch lessons:", error?.message);
    process.exit(1);
  }

  console.log(`Found ${lessons.length} lessons to process\n`);

  for (const lesson of lessons) {
    await processLesson(lesson as Parameters<typeof processLesson>[0]);
  }

  console.log(`\n\u2550\u2550\u2550 SUMMARY \u2550\u2550\u2550`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\n\u2728 Done!\n`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
