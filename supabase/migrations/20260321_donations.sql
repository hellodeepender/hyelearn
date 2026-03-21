CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  donor_name text NOT NULL DEFAULT 'Anonymous',
  donor_email text,
  amount_cents integer,
  currency text DEFAULT 'usd',
  show_name boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public donations" ON donations FOR SELECT USING (show_name = true);
CREATE POLICY "Admins manage donations" ON donations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_donations_public ON donations (created_at DESC) WHERE show_name = true;
