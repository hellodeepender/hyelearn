import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createDbClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await request.json() as { code: string };
  if (!code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const db = serviceKey
    ? createDbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : supabase;

  // Validate promo code
  const { data: promo, error: promoErr } = await db
    .from("promo_codes")
    .select("id, plan_id, duration_days, max_uses, current_uses, expires_at, is_active")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (promoErr || !promo) return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  if (!promo.is_active) return NextResponse.json({ error: "This code is no longer active" }, { status: 400 });
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return NextResponse.json({ error: "This code has expired" }, { status: 400 });
  if (promo.max_uses > 0 && promo.current_uses >= promo.max_uses) return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 });

  // Create gift subscription
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + promo.duration_days);

  const { error: subErr } = await db.from("subscriptions").insert({
    user_id: user.id,
    plan_id: promo.plan_id,
    status: "gift",
    current_period_start: new Date().toISOString(),
    current_period_end: endDate.toISOString(),
  });

  if (subErr) {
    console.error("[promo/redeem] Insert error:", subErr);
    return NextResponse.json({ error: "Failed to apply promo code" }, { status: 500 });
  }

  // Increment usage
  await db.from("promo_codes").update({ current_uses: promo.current_uses + 1 }).eq("id", promo.id);

  return NextResponse.json({ success: true, days: promo.duration_days });
}
