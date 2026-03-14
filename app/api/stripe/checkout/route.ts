import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  // Debug: log env var availability
  console.log("[stripe/checkout] env check:", {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasMonthlyPrice: !!process.env.STRIPE_PRICE_MONTHLY,
    hasYearlyPrice: !!process.env.STRIPE_PRICE_YEARLY,
  });

  // Auth check
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not logged in. Please sign in first." }, { status: 401 });
  }

  // Parse body
  let interval: string;
  try {
    const body = await request.json();
    interval = body.interval ?? "monthly";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate Stripe secret key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[stripe/checkout] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({
      error: "Payment system is not configured. Please contact support.",
      debug: "STRIPE_SECRET_KEY missing",
    }, { status: 500 });
  }

  // Validate price IDs
  const priceId = interval === "yearly"
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    console.error("[stripe/checkout] Price ID not configured for interval:", interval);
    return NextResponse.json({
      error: `Payment plan not configured for ${interval} billing. Please contact support.`,
      debug: `STRIPE_PRICE_${interval.toUpperCase()} env var is missing`,
    }, { status: 500 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/student?subscription=success`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id },
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id },
      },
    });

    console.log("[stripe/checkout] Session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[stripe/checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
