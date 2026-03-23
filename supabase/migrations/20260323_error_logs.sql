-- Error logging table for client-side error monitoring
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  locale TEXT,
  url TEXT,
  error_message TEXT,
  error_stack TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert errors" ON error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read errors" ON error_logs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
