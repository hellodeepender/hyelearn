-- Ensure all existing users who don't have a subscription get gifted Family access
INSERT INTO subscriptions (user_id, plan_id, status, current_period_end)
SELECT p.id, (SELECT id FROM plans WHERE slug = 'family'), 'gift', now() + interval '1 year'
FROM profiles p
WHERE p.id NOT IN (SELECT user_id FROM subscriptions)
ON CONFLICT DO NOTHING;
