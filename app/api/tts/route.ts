import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getCacheKey(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64url");
}

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log("[tts] DB client config:", { hasUrl: !!url, keySource: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SERVICE_ROLE" : "ANON" });
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureBucket(db: { storage: any }) {
  const { error } = await db.storage.createBucket("audio", {
    public: true,
    allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/L16"],
  });
  if (error && !error.message?.includes("already exists")) {
    console.error("[tts] Bucket creation error:", error.message);
  }
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")?.trim();
  console.log("[tts] TTS request for:", text);

  try {
    if (!text || text.length > 200) {
      console.log("[tts] Rejected: empty or too long");
      return new NextResponse(null, { status: 400 });
    }

    const cacheKey = getCacheKey(text);
    const storagePath = `words/${cacheKey}.wav`;
    const db = getDb();

    // Ensure bucket exists before any storage operations
    await ensureBucket(db);

    // Check cache
    const { data: existing, error: downloadErr } = await db.storage.from("audio").download(storagePath);
    console.log("[tts] Cache check:", { found: !!existing, error: downloadErr?.message ?? null });

    if (existing) {
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio/${storagePath}`;
      console.log("[tts] Cache hit, redirecting to:", publicUrl);
      return NextResponse.redirect(publicUrl);
    }

    // Generate via Gemini TTS
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("[tts] Gemini API key present:", !!apiKey);
    if (!apiKey) {
      console.error("[tts] GEMINI_API_KEY is not set");
      return new NextResponse(null, { status: 500 });
    }

    const requestBody = {
      contents: [{
        parts: [{ text: `Say the following Armenian word clearly: ${text}` }],
      }],
      generationConfig: {
        response_modalities: ["AUDIO"],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: {
              voice_name: "Aoede",
            },
          },
          language_code: "hy-AM",
        },
      },
    };
    console.log("[tts] Gemini TTS request body:", JSON.stringify(requestBody));

    const ttsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("[tts] Gemini TTS response status:", ttsRes.status);

    if (!ttsRes.ok) {
      const errorBody = await ttsRes.text().catch(() => "(could not read body)");
      console.error("[tts] Gemini TTS error response:", errorBody);
      return new NextResponse(null, { status: 500 });
    }

    const data = await ttsRes.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!audioPart) {
      console.error("[tts] Gemini TTS returned no audio data. Response:", JSON.stringify(data).slice(0, 500));
      return new NextResponse(null, { status: 500 });
    }

    const mimeType = audioPart.mimeType || "audio/wav";
    console.log("[tts] Audio generated, mimeType:", mimeType, "size:", audioPart.data.length, "base64 chars");
    const audioBuffer = Buffer.from(audioPart.data, "base64");

    console.log("[tts] Uploading to Supabase storage...");
    const { error: uploadErr } = await db.storage
      .from("audio")
      .upload(storagePath, audioBuffer, { contentType: mimeType, upsert: true });

    if (uploadErr) {
      console.error("[tts] Supabase upload error:", uploadErr.message);
    } else {
      console.log("[tts] Upload successful:", storagePath);
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[tts] TTS route error:", err);
    return new NextResponse(null, { status: 500 });
  }
}
