import { NextResponse } from "next/server";

export async function GET() {
  const testWords = ["խնdzor", "mama", "apple"];

  const html = testWords.map(w =>
    `<div style="margin:20px">
      <h2>${w}</h2>
      <audio controls src="/api/tts?text=${encodeURIComponent(w)}"></audio>
    </div>`
  ).join("");

  return new NextResponse(
    `<html><body style="font-family:sans-serif"><h1>TTS Test</h1>${html}</body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
