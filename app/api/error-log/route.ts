import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Rate limit: 10 per minute per IP
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const minute = 60_000;
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < minute);
  if (timestamps.length >= 10) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|mediapartners|googl/i;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const userAgent = body.userAgent ?? request.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(userAgent)) {
    return NextResponse.json({ ok: true }); // silently ignore bots
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  await db.from("error_logs").insert({
    error_message: String(body.message).slice(0, 2000),
    error_stack: body.stack ? String(body.stack).slice(0, 4000) : null,
    url: body.url ? String(body.url).slice(0, 500) : null,
    locale: body.locale ?? null,
    user_agent: userAgent.slice(0, 500),
    user_id: body.userId ?? null,
  });

  return NextResponse.json({ ok: true });
}
