import { createClient } from "@supabase/supabase-js";

function getServiceDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/** Get all locales that have at least one active level */
export async function getPublicLocales() {
  const db = getServiceDb();
  const { data } = await db
    .from("curriculum_levels")
    .select("locale")
    .eq("is_active", true);
  if (!data) return [];
  const unique = [...new Set(data.map((d) => d.locale as string))];
  return unique.filter((l) => l && l !== "en");
}

/** Get all active levels for a locale — no progress, no user needed */
export async function getPublicLevels(locale: string) {
  const db = getServiceDb();
  const { data: levels } = await db
    .from("curriculum_levels")
    .select("id, slug, title, description, grade_value, sort_order")
    .eq("is_active", true)
    .eq("locale", locale)
    .order("sort_order");

  if (!levels) return [];

  const { data: allLessons } = await db
    .from("curriculum_lessons")
    .select("id, unit_id, curriculum_units!inner(level_id)")
    .eq("is_active", true)
    .eq("locale", locale);

  return levels.map((level) => {
    const levelLessons = allLessons?.filter(
      (l) => (l.curriculum_units as unknown as { level_id: string }).level_id === level.id
    ) ?? [];
    return { ...level, totalLessons: levelLessons.length };
  });
}

/** Get all active units for a level — no progress */
export async function getPublicUnits(levelId: string, locale: string) {
  const db = getServiceDb();
  const { data: units } = await db
    .from("curriculum_units")
    .select("id, slug, title, description, sort_order")
    .eq("level_id", levelId)
    .eq("is_active", true)
    .eq("locale", locale)
    .order("sort_order");

  if (!units) return [];

  const unitIds = units.map((u) => u.id);
  const { data: lessons } = await db
    .from("curriculum_lessons")
    .select("id, unit_id")
    .in("unit_id", unitIds)
    .eq("is_active", true)
    .eq("locale", locale);

  return units.map((unit) => {
    const unitLessons = lessons?.filter((l) => l.unit_id === unit.id) ?? [];
    return { ...unit, totalLessons: unitLessons.length };
  });
}

/** Get all active lessons for a unit — no progress, all unlocked */
export async function getPublicLessons(unitId: string, locale: string) {
  const db = getServiceDb();
  const { data: lessons } = await db
    .from("curriculum_lessons")
    .select("id, slug, title, description, lesson_type, template_type, sort_order")
    .eq("unit_id", unitId)
    .eq("is_active", true)
    .eq("locale", locale)
    .order("sort_order");

  return (lessons ?? []).map((lesson) => ({
    ...lesson,
    unlocked: true,
    passed: false,
    score: null,
    total: null,
    attempts: 0,
  }));
}
