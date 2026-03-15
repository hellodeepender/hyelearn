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
  const { error } = await db.storage.createBucket("audio", {
    public: true,
    allowedMimeTypes: ["audio/mpeg"],
  });
  if (error && !error.message?.includes("already exists")) {
    console.error("[tts] error:", error.message);
  }
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")?.trim();
  console.log("[tts]", text);

  try {
    if (!text || text.length > 200) {
      return new NextResponse(null, { status: 400 });
    }

    const cacheKey = getCacheKey(text);
    const storagePath = `words/${cacheKey}.mp3`;
    const db = getDb();

    await ensureBucket(db);

    const { data: existing } = await db.storage.from("audio").download(storagePath);

    if (existing) {
      console.log("[tts] cache hit");
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
      return NextResponse.redirect(publicUrl);
    }

    const apiKey = process.env.NARAKEET_API_KEY;
    if (!apiKey) {
      console.error("[tts] error: NARAKEET_API_KEY is not set");
      return new NextResponse(null, { status: 500 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const ttsRes = await fetch(
      "https://api.narakeet.com/text-to-speech/mp3?voice=nune",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "text/plain",
          "accept": "application/octet-stream",
        },
        body: text,
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!ttsRes.ok) {
      const errorBody = await ttsRes.text().catch(() => "");
      console.error("[tts] error:", ttsRes.status, errorBody);
      return new NextResponse(null, { status: 500 });
    }

    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());

    if (audioBuffer.length < 1000) {
      console.error("[tts] error: audio truncated,", audioBuffer.length, "bytes");
      return new NextResponse(null, { status: 500 });
    }

    const { error: uploadErr } = await db.storage
      .from("audio")
      .upload(storagePath, audioBuffer, { contentType: "audio/mpeg", upsert: true });

    if (uploadErr) {
      console.error("[tts] error:", uploadErr.message);
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[tts] error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
