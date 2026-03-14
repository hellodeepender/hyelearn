import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const { data: familyPlan } = await db.from("plans").select("id").eq("slug", "family").single();
      if (!familyPlan) break;

      await db.from("subscriptions").insert({
        user_id: userId,
        plan_id: familyPlan.id,
        status: "active",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subId = invoice.subscription as string | null;
      if (!subId) break;

      await db.from("subscriptions")
        .update({
          status: "active",
          current_period_start: new Date(((invoice.period_start as number) ?? 0) * 1000).toISOString(),
          current_period_end: new Date(((invoice.period_end as number) ?? 0) * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as unknown as Record<string, unknown>;
      const subId = invoice.subscription as string | null;
      if (subId) {
        await db.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await db.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", sub.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
