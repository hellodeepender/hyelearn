-- Auto-update profiles.total_xp whenever student_xp is inserted
CREATE OR REPLACE FUNCTION update_profile_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET total_xp = (SELECT COALESCE(SUM(xp_amount), 0) FROM student_xp WHERE student_id = NEW.student_id)
  WHERE id = NEW.student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_update_total_xp ON student_xp;
CREATE TRIGGER auto_update_total_xp
  AFTER INSERT ON student_xp
  FOR EACH ROW EXECUTE FUNCTION update_profile_total_xp();

-- Backfill all existing students
UPDATE profiles p
SET total_xp = (SELECT COALESCE(SUM(xp_amount), 0) FROM student_xp WHERE student_id = p.id);
