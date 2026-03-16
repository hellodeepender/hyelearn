-- Rewards system: XP tracking, badges, streak freezes

-- XP log
CREATE TABLE student_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_student_xp_student ON student_xp(student_id);

ALTER TABLE student_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own xp" ON student_xp FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students insert own xp" ON student_xp FOR INSERT WITH CHECK (student_id = auth.uid());

-- Badge tracking
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_slug TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_slug)
);
CREATE INDEX idx_student_badges_student ON student_badges(student_id);

ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own badges" ON student_badges FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students insert own badges" ON student_badges FOR INSERT WITH CHECK (student_id = auth.uid());

-- Denormalized XP total and streak freeze on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_freeze_count INTEGER DEFAULT 1;
