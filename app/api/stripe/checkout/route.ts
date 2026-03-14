import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interval } = await request.json() as { interval: "monthly" | "yearly" };

  const priceId = interval === "yearly"
    ? process.env.STRIPE_PRICE_YEARLY!
    : process.env.STRIPE_PRICE_MONTHLY!;

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  try {
    const session = await createCheckoutSession(
      user.email!,
      priceId,
      user.id,
      `${origin}/student?subscription=success`,
      `${origin}/pricing`
    );
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
