-- Add email preference column for weekly progress emails
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_weekly_progress BOOLEAN DEFAULT true;
