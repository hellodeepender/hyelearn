import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getCacheKey(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64url");
}

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureBucket(db: { storage: any }) {
  await db.storage.createBucket("audio", { public: true }).catch(() => {
    // Bucket already exists — ignore
  });
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")?.trim();

  if (!text || text.length > 200) {
    return new NextResponse(null, { status: 400 });
  }

  const cacheKey = getCacheKey(text);
  const storagePath = `words/${cacheKey}.mp3`;
  const db = getDb();

  // Check cache — if file exists, redirect to the public URL
  const { data: existing } = await db.storage.from("audio").download(storagePath);

  if (existing) {
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
    return NextResponse.redirect(publicUrl);
  }

  // Generate via Google Cloud TTS
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new NextResponse(null, { status: 500 });
  }

  let audioContent: string;
  try {
    const ttsRes = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: "hy-AM", ssmlGender: "FEMALE" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    if (!ttsRes.ok) {
      console.error("[tts] Google TTS failed:", ttsRes.status, await ttsRes.text().catch(() => ""));
      return new NextResponse(null, { status: 500 });
    }

    const data = await ttsRes.json();
    audioContent = data.audioContent;
  } catch (err) {
    console.error("[tts] Google TTS error:", err);
    return new NextResponse(null, { status: 500 });
  }

  if (!audioContent) {
    return new NextResponse(null, { status: 500 });
  }

  const audioBuffer = Buffer.from(audioContent, "base64");

  // Ensure bucket exists, then upload
  await ensureBucket(db);
  await db.storage
    .from("audio")
    .upload(storagePath, audioBuffer, { contentType: "audio/mpeg", upsert: true })
    .catch((err) => {
      console.error("[tts] Storage upload failed:", err);
    });

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
