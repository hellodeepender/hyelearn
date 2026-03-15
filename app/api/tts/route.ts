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
    console.error("[tts] Bucket creation error:", error.message);
  }
}

// In-memory rate limiter: 30 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return new NextResponse(null, { status: 429 });
  }

  const text = request.nextUrl.searchParams.get("text")?.trim();
  console.log("[tts] TTS request for:", text);

  try {
    if (!text || text.length > 200) {
      return new NextResponse(null, { status: 400 });
    }

    const cacheKey = getCacheKey(text);
    const storagePath = `words/${cacheKey}.mp3`;
    const db = getDb();

    // Ensure bucket exists before any storage operations
    await ensureBucket(db);

    // Check cache
    const { data: existing } = await db.storage.from("audio").download(storagePath);

    if (existing) {
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
      console.log("[tts] Cache hit, redirecting to:", publicUrl);
      return NextResponse.redirect(publicUrl);
    }

    // Generate via Narakeet TTS
    const apiKey = process.env.NARAKEET_API_KEY;
    if (!apiKey) {
      console.error("[tts] NARAKEET_API_KEY is not set");
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
      const errorBody = await ttsRes.text().catch(() => "(could not read body)");
      console.error("[tts] Narakeet TTS error response:", errorBody);
      return new NextResponse(null, { status: 500 });
    }

    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());

    if (audioBuffer.length < 1000) {
      console.error("[tts] Audio too small, likely truncated:", audioBuffer.length);
      return new NextResponse(null, { status: 500 });
    }

    const { error: uploadErr } = await db.storage
      .from("audio")
      .upload(storagePath, audioBuffer, { contentType: "audio/mpeg", upsert: true });

    if (uploadErr) {
      console.error("[tts] Supabase upload error:", uploadErr.message);
    } else {
      console.log("[tts] Upload successful:", storagePath);
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[tts] TTS route error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
