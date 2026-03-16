-- Add Stripe customer ID to profiles for portal access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
