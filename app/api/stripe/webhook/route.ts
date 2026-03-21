import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      // Check if this is a donation (has donor_name in metadata)
      if (session.metadata?.donor_name) {
        const { error: donationErr } = await db.from("donations").upsert({
          stripe_session_id: session.id,
          stripe_payment_intent_id: session.payment_intent as string,
          donor_name: session.metadata.donor_name || "Anonymous",
          donor_email: session.customer_details?.email || null,
          amount_cents: session.amount_total || 0,
          currency: session.currency || "usd",
          show_name: session.metadata.show_name === "true",
          message: session.metadata.message || null,
        }, { onConflict: "stripe_session_id" });
        if (donationErr) {
          console.error("[webhook] Donation insert error:", donationErr.message);
        } else {
          console.log("[webhook] Donation recorded:", session.metadata.donor_name, session.amount_total);
        }
        break;
      }

      // Otherwise handle as subscription checkout
      const userId = session.metadata?.userId;
      if (!userId) break;

      await db.from("profiles").update({
        subscription_tier: "family",
        stripe_customer_id: session.customer as string,
      }).eq("id", userId);

      const { data: familyPlan } = await db.from("plans").select("id").eq("slug", "family").single();
      if (familyPlan) {
        await db.from("subscriptions").insert({
          user_id: userId,
          plan_id: familyPlan.id,
          status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        });
      }

      console.log("[webhook] checkout.session.completed for user:", userId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as unknown as Record<string, unknown>;
      const subId = sub.id as string;
      const status = sub.status as string;

      // Find user by subscription ID
      const { data: subRow } = await db.from("subscriptions").select("user_id").eq("stripe_subscription_id", subId).single();
      if (!subRow) break;

      if (status === "active") {
        await db.from("profiles").update({ subscription_tier: "family" }).eq("id", subRow.user_id);
        await db.from("subscriptions").update({ status: "active" }).eq("stripe_subscription_id", subId);
      } else if (status === "past_due" || status === "canceled" || status === "unpaid") {
        await db.from("profiles").update({ subscription_tier: "free" }).eq("id", subRow.user_id);
        await db.from("subscriptions").update({ status }).eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subId = invoice.subscription as string | null;
      if (!subId) break;

      await db.from("subscriptions").update({
        status: "active",
        current_period_start: new Date(((invoice.period_start as number) ?? 0) * 1000).toISOString(),
        current_period_end: new Date(((invoice.period_end as number) ?? 0) * 1000).toISOString(),
      }).eq("stripe_subscription_id", subId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subId = invoice.subscription as string | null;
      if (subId) {
        await db.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
        const { data: subRow } = await db.from("subscriptions").select("user_id").eq("stripe_subscription_id", subId).single();
        if (subRow) {
          console.log("[webhook] Payment failed for user:", subRow.user_id);
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await db.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", sub.id);
      const { data: subRow } = await db.from("subscriptions").select("user_id").eq("stripe_subscription_id", sub.id).single();
      if (subRow) {
        await db.from("profiles").update({ subscription_tier: "free" }).eq("id", subRow.user_id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
