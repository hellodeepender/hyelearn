-- Sunday School tables
CREATE TABLE IF NOT EXISTS sunday_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'hy',
  unit_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_native TEXT,
  description TEXT,
  season TEXT,
  week_start INTEGER NOT NULL,
  week_end INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(locale, unit_number)
);

CREATE TABLE IF NOT EXISTS sunday_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale TEXT NOT NULL DEFAULT 'hy',
  unit_id UUID NOT NULL REFERENCES sunday_units(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_native TEXT,
  opening JSONB,
  story JSONB,
  vocabulary JSONB,
  activity JSONB,
  closing JSONB,
  liturgical_themes TEXT[],
  age_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(locale, lesson_number)
);

CREATE INDEX idx_sunday_units_locale ON sunday_units(locale);
CREATE INDEX idx_sunday_lessons_locale ON sunday_lessons(locale);
CREATE INDEX idx_sunday_lessons_unit ON sunday_lessons(unit_id);

-- RLS: public read, admin-only write
ALTER TABLE sunday_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE sunday_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sunday_units" ON sunday_units FOR SELECT USING (true);
CREATE POLICY "Public read sunday_lessons" ON sunday_lessons FOR SELECT USING (true);

CREATE POLICY "Admin insert sunday_units" ON sunday_units FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin update sunday_units" ON sunday_units FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin delete sunday_units" ON sunday_units FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert sunday_lessons" ON sunday_lessons FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin update sunday_lessons" ON sunday_lessons FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin delete sunday_lessons" ON sunday_lessons FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
