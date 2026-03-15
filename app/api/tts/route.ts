import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Western Armenian transliteration (Hübschmann-Meillet based)
function transliterateArmenian(text: string): string {
  // Handle digraphs first (multi-char sequences)
  let result = text;
  const digraphs: [string, string][] = [
    ["\u0578\u0582", "u"],   // ու -> u
    ["\u0548\u0582", "U"],   // Ou -> U
    ];
  for (const [arm, lat] of digraphs) {
    result = result.split(arm).join(lat);
  }

  // Single character map using unicode escapes
  const map: Record<string, string> = {
    "\u0561": "a",    // ա
    "\u0562": "b",    // բ
    "\u0563": "g",    // գ
    "\u0564": "d",    // դ
    "\u0565": "ye",   // ե
    "\u0566": "z",    // զ
    "\u0567": "e",    // է
    "\u0568": "u",    // ը
    "\u0569": "t",    // թ
    "\u056A": "zh",   // ժ
    "\u056B": "i",    // ի
    "\u056C": "l",    // լ
    "\u056D": "kh",   // խ
    "\u056E": "ts",   // ծ
    "\u056F": "k",    // կ
    "\u0570": "h",    // հ
    "\u0571": "dz",   // ձ
    "\u0572": "gh",   // ղ
    "\u0573": "ch",   // ճ
    "\u0574": "m",    // մ
    "\u0575": "y",    // յ
    "\u0576": "n",    // ն
    "\u0577": "sh",   // շ
    "\u0578": "vo",   // ո
    "\u0579": "ch",   // չ
    "\u057A": "p",    // պ
    "\u057B": "j",    // ջ
    "\u057C": "r",    // ռ
    "\u057D": "s",    // ս
    "\u057E": "v",    // վ
    "\u057F": "t",    // տ
    "\u0580": "r",    // ր
    "\u0581": "ts",   // ց
    "\u0582": "u",    // ու (standalone, rare after digraph pass)
    "\u0583": "p",    // փ
    "\u0584": "k",    // ք
    "\u0585": "o",    // օ
    "\u0586": "f",    // ֆ
    "\u0587": "yev",  // և

    // Uppercase
    "\u0531": "A",    // Ա
    "\u0532": "B",    // Բ
    "\u0533": "G",    // Գ
    "\u0534": "D",    // Դ
    "\u0535": "Ye",   // Ե
    "\u0536": "Z",    // Զ
    "\u0537": "E",    // Է
    "\u0538": "U",    // Ը
    "\u0539": "T",    // Թ
    "\u053A": "Zh",   // Ժ
    "\u053B": "I",    // Ի
    "\u053C": "L",    // Լ
    "\u053D": "Kh",   // Խ
    "\u053E": "Ts",   // Ծ
    "\u053F": "K",    // Կ
    "\u0540": "H",    // Հ
    "\u0541": "Dz",   // Ձ
    "\u0542": "Gh",   // Ղ
    "\u0543": "Ch",   // Ճ
    "\u0544": "M",    // Մ
    "\u0545": "Y",    // Յ
    "\u0546": "N",    // Ն
    "\u0547": "Sh",   // Շ
    "\u0548": "Vo",   // Ո
    "\u0549": "Ch",   // Չ
    "\u054A": "P",    // Պ
    "\u054B": "J",    // Ջ
    "\u054C": "R",    // Ռ
    "\u054D": "S",    // Ս
    "\u054E": "V",    // Վ
    "\u054F": "T",    // Տ
    "\u0550": "R",    // Ր
    "\u0551": "Ts",   // Ց
    "\u0552": "U",    // Ւ
    "\u0553": "P",    // Փ
    "\u0554": "K",    // Ք
    "\u0555": "O",    // Օ
    "\u0556": "F",    // Ֆ
  };

  let output = "";
  for (const char of result) {
    output += map[char] ?? char;
  }
  return output;
}

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
    allowedMimeTypes: ["audio/mpeg"],
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
    const storagePath = `words/${cacheKey}.mp3`;
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

    // Generate via OpenAI TTS
    const apiKey = process.env.OPENAI_API_KEY;
    console.log("[tts] OpenAI API key present:", !!apiKey);
    if (!apiKey) {
      console.error("[tts] OPENAI_API_KEY is not set");
      return new NextResponse(null, { status: 500 });
    }

    const ttsInput = transliterateArmenian(text);
    console.log("[tts] Transliterated:", text, "->", ttsInput);

    console.log("[tts] Calling OpenAI TTS...");
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: ttsInput,
        voice: "nova",
        response_format: "mp3",
      }),
    });

    console.log("[tts] OpenAI TTS response status:", ttsRes.status);

    if (!ttsRes.ok) {
      const errorBody = await ttsRes.text().catch(() => "(could not read body)");
      console.error("[tts] OpenAI TTS error response:", errorBody);
      return new NextResponse(null, { status: 500 });
    }

    const audioBuffer = Buffer.from(await ttsRes.arrayBuffer());
    console.log("[tts] Audio generated, size:", audioBuffer.length, "bytes");

    console.log("[tts] Uploading to Supabase storage...");
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
