import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);

  let body: { amount: number; donorName?: string; showName?: boolean; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, donorName, showName, message } = body;
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Amount must be at least $1" }, { status: 400 });
  }

  const amountCents = Math.round(amount * 100);
  const origin = req.headers.get("origin") || "https://diasporalearn.org";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Donation to DiasporaLearn",
            description: "Supporting heritage language education for diaspora communities",
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        donor_name: donorName || "Anonymous",
        show_name: showName ? "true" : "false",
        message: message || "",
      },
      success_url: `${origin}/pricing?donated=true`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[donations/checkout] Stripe error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
