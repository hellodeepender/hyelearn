import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { interval } = await request.json() as { interval: "monthly" | "yearly" };

  // TODO: Replace these with your actual Stripe Price IDs from the Stripe Dashboard
  const priceId = interval === "yearly"
    ? (process.env.STRIPE_PRICE_YEARLY ?? "price_yearly_placeholder")
    : (process.env.STRIPE_PRICE_MONTHLY ?? "price_monthly_placeholder");

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email!,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/student?subscription=success`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id },
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id },
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe/checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
