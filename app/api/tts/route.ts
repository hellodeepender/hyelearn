import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getCacheKey(text: string): string {
  // Simple base64-based filename safe for storage paths
  return Buffer.from(text, "utf-8").toString("base64url");
}

function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text")?.trim();

  if (!text || text.length > 200) {
    return new NextResponse(null, { status: 400 });
  }

  const cacheKey = getCacheKey(text);
  const storagePath = `words/${cacheKey}.mp3`;
  const db = getDb();

  // Check cache in Supabase Storage
  const { data: existing } = await db.storage.from("audio").download(storagePath);

  if (existing) {
    const bytes = await existing.arrayBuffer();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Generate via Google Cloud TTS
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return new NextResponse(null, { status: 404 });
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
          voice: { languageCode: "hy-AM", name: "hy-AM-Wavenet-A" },
          audioConfig: { audioEncoding: "MP3" },
        }),
      }
    );

    if (!ttsRes.ok) {
      // Fallback to Standard voice if Wavenet unavailable
      const fallbackRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: "hy-AM", name: "hy-AM-Standard-A" },
            audioConfig: { audioEncoding: "MP3" },
          }),
        }
      );

      if (!fallbackRes.ok) {
        console.error("[tts] Google TTS failed:", await fallbackRes.text().catch(() => ""));
        return new NextResponse(null, { status: 404 });
      }

      const fallbackData = await fallbackRes.json();
      audioContent = fallbackData.audioContent;
    } else {
      const data = await ttsRes.json();
      audioContent = data.audioContent;
    }
  } catch (err) {
    console.error("[tts] Google TTS error:", err);
    return new NextResponse(null, { status: 404 });
  }

  if (!audioContent) {
    return new NextResponse(null, { status: 404 });
  }

  const audioBuffer = Buffer.from(audioContent, "base64");

  // Upload to Supabase Storage for caching
  await db.storage
    .from("audio")
    .upload(storagePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    })
    .catch(() => {
      // Storage write failure is non-fatal — audio still served
    });

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
