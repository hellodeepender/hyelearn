CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly INT,
  price_yearly INT,
  max_students INT DEFAULT 3,
  ai_sessions_limit INT DEFAULT -1,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'trial',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id),
  duration_days INT NOT NULL DEFAULT 30,
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions_used INT DEFAULT 0,
  UNIQUE(user_id, session_date)
);

ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage DISABLE ROW LEVEL SECURITY;

INSERT INTO plans (slug, name, description, price_monthly, price_yearly, max_students, ai_sessions_limit, features) VALUES
('free', 'Free', 'Try HyeLearn with limited access', 0, 0, 1, 3, '{"curriculum_access": "first_lesson_only", "certificates": false, "ai_practice": "limited"}'),
('family', 'Family', 'Full access for your family', 999, 7999, 3, -1, '{"curriculum_access": "full", "certificates": true, "ai_practice": "unlimited"}'),
('school', 'School', 'For Armenian day schools and classrooms', 0, 0, -1, -1, '{"curriculum_access": "full", "certificates": true, "ai_practice": "unlimited", "teacher_dashboard": true, "class_management": true}');

-- Gift existing users full access
INSERT INTO subscriptions (user_id, plan_id, status, current_period_end)
SELECT p.id, pl.id, 'gift', now() + interval '1 year'
FROM profiles p, plans pl
WHERE pl.slug = 'family';
