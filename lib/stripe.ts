import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export async function createCheckoutSession(
  customerEmail: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const s = getStripe();
  return s.checkout.sessions.create({
    customer_email: customerEmail,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: { trial_period_days: 7, metadata: { userId } },
  });
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const s = getStripe();
  return s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
