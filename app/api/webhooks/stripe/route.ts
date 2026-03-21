import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    console.error("[webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase.from("donations").upsert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      donor_name: session.metadata?.donor_name || "Anonymous",
      donor_email: session.customer_details?.email || null,
      amount_cents: session.amount_total || 0,
      currency: session.currency || "usd",
      show_name: session.metadata?.show_name === "true",
      message: session.metadata?.message || null,
    }, { onConflict: "stripe_session_id" });

    if (error) {
      console.error("[webhook] Supabase insert error:", error.message);
    } else {
      console.log("[webhook] Donation recorded:", session.metadata?.donor_name, session.amount_total);
    }
  }

  return NextResponse.json({ received: true });
}
