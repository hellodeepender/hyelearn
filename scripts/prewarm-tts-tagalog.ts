/**
 * Pre-warm TTS cache for all Tagalog curriculum vocabulary.
 *
 * The /api/tts route generates audio on-demand via Narakeet and caches
 * it in Supabase storage. This script extracts all Tagalog words from
 * curated_exercises and hits the TTS API for each one, so the first
 * real user gets instant playback instead of waiting for generation.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... NARAKEET_API_KEY=... \
 *     npx tsx scripts/prewarm-tts-tagalog.ts
 *
 *   Optional: --dry-run (just list words, don't generate)
 *             --dry-run (just list words, don't generate)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const NARAKEET_KEY = process.env.NARAKEET_API_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!NARAKEET_KEY) {
  console.error("Missing NARAKEET_API_KEY. Get one at https://www.narakeet.com/");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const VOICE = "bianca";
const DELAY_MS = 600;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function getCacheKey(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64url");
}

async function fileExists(path: string): Promise<boolean> {
  const { data } = await db.storage.from("audio").download(path);
  return !!data;
}

async function generateAndUpload(text: string): Promise<boolean> {
  const cacheKey = getCacheKey(text);
  const storagePath = `words/tl/${cacheKey}.mp3`;

  // Check if already cached
  if (await fileExists(storagePath)) return false;

  // Generate via Narakeet
  const res = await fetch(
    `https://api.narakeet.com/text-to-speech/mp3?voice=${VOICE}`,
    {
      method: "POST",
      headers: {
        "x-api-key": NARAKEET_KEY,
        "Content-Type": "text/plain",
        accept: "application/octet-stream",
      },
      body: text,
    }
  );

  if (!res.ok) {
    console.error(`  FAIL: "${text}" — ${res.status}`);
    return false;
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  if (audioBuffer.length < 500) {
    console.error(`  FAIL: "${text}" — audio too small (${audioBuffer.length}b)`);
    return false;
  }

  const { error } = await db.storage
    .from("audio")
    .upload(storagePath, audioBuffer, { contentType: "audio/mpeg", upsert: true });

  if (error) {
    console.error(`  UPLOAD FAIL: "${text}" — ${error.message}`);
    return false;
  }

  return true;
}

async function main() {
  console.log("\n🔊 Pre-warming Tagalog TTS cache...\n");

  // Ensure bucket exists
  await db.storage.createBucket("audio", {
    public: true,
    allowedMimeTypes: ["audio/mpeg"],
  }).catch(() => {});

  // Extract all unique Tagalog text from exercises
  const { data: exercises } = await db
    .from("curated_exercises")
    .select("exercise_data")
    .eq("locale", "tl")
    .eq("status", "approved");

  if (!exercises || exercises.length === 0) {
    console.log("  No Tagalog exercises found. Run seed scripts first.");
    process.exit(0);
  }

  const texts = new Set<string>();

  for (const ex of exercises) {
    const d = ex.exercise_data as Record<string, unknown>;

    // Learn cards
    if (d.primary_text) texts.add(String(d.primary_text));
    if (d.letter) texts.add(String(d.letter));
    if (d.letter_name) texts.add(String(d.letter_name));
    if (d.example_word) texts.add(String(d.example_word));

    // MC questions and options
    if (d.question_tl) texts.add(String(d.question_tl));
    const options = d.options as { text_tl?: string }[] | undefined;
    if (options) {
      for (const opt of options) {
        if (opt.text_tl) texts.add(opt.text_tl);
      }
    }

    // Fill blank
    if (d.answer_tl) texts.add(String(d.answer_tl));
    const distractors = d.distractors_tl as string[] | undefined;
    if (distractors) {
      for (const dist of distractors) texts.add(dist);
    }

    // Matching
    if (d.left_tl) texts.add(String(d.left_tl));
  }

  // Filter out empty and very short strings
  const words = [...texts].filter((t) => t.length >= 1 && !t.startsWith("_")).sort();

  console.log(`  Found ${words.length} unique Tagalog texts to pre-warm\n`);

  if (dryRun) {
    words.forEach((w) => console.log(`  ${w}`));
    console.log(`\n  Dry run complete. ${words.length} words would be generated.`);
    return;
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    try {
      const wasGenerated = await generateAndUpload(word);
      if (wasGenerated) {
        generated++;
        console.log(`  [${i + 1}/${words.length}] ✓ "${word}"`);
      } else {
        skipped++;
      }
      await sleep(DELAY_MS);
    } catch (err) {
      errors++;
      console.error(`  [${i + 1}/${words.length}] ✗ "${word}": ${err}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Already cached: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${words.length}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
