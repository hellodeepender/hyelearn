import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
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

  // Validate env vars
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      error: "Payment system is not configured. Set STRIPE_SECRET_KEY env var.",
    }, { status: 500 });
  }

  const priceId = interval === "yearly"
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY;

  if (!priceId) {
    return NextResponse.json({
      error: `Stripe price not configured. Set STRIPE_PRICE_${interval.toUpperCase()} env var.`,
    }, { status: 500 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    // Dynamic import to avoid build-time issues
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/student?subscription=success`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
    });

    console.log("[stripe/checkout] Session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe/checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
