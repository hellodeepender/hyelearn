import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLevelsWithProgress(supabase: SupabaseClient, userId: string) {
  const { data: levels } = await supabase
    .from("curriculum_levels")
    .select("id, slug, title, description, grade_value, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (!levels) return [];

  // Get all lessons and student progress in one query each
  const { data: allLessons } = await supabase
    .from("curriculum_lessons")
    .select("id, unit_id, curriculum_units!inner(level_id)")
    .eq("is_active", true);

  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, passed")
    .eq("student_id", userId);

  const passedSet = new Set(progress?.filter((p) => p.passed).map((p) => p.lesson_id) ?? []);
  const attemptedSet = new Set(progress?.map((p) => p.lesson_id) ?? []);

  return levels.map((level, i) => {
    const levelLessons = allLessons?.filter(
      (l) => (l.curriculum_units as unknown as { level_id: string }).level_id === level.id
    ) ?? [];
    const totalLessons = levelLessons.length;
    const completedLessons = levelLessons.filter((l) => passedSet.has(l.id)).length;

    // First level always unlocked; others require previous level completion
    const unlocked = i === 0 || (levels[i - 1] && (() => {
      const prevLevelLessons = allLessons?.filter(
        (l) => (l.curriculum_units as unknown as { level_id: string }).level_id === levels[i - 1].id
      ) ?? [];
      return prevLevelLessons.length > 0 && prevLevelLessons.every((l) => passedSet.has(l.id));
    })());

    return {
      ...level,
      totalLessons,
      completedLessons,
      unlocked,
      started: levelLessons.some((l) => attemptedSet.has(l.id)),
    };
  });
}

export async function getUnitsWithProgress(
  supabase: SupabaseClient,
  userId: string,
  levelId: string
) {
  const { data: units } = await supabase
    .from("curriculum_units")
    .select("id, slug, title, description, sort_order")
    .eq("level_id", levelId)
    .eq("is_active", true)
    .order("sort_order");

  if (!units) return [];

  const unitIds = units.map((u) => u.id);

  const { data: lessons } = await supabase
    .from("curriculum_lessons")
    .select("id, unit_id, lesson_type")
    .in("unit_id", unitIds)
    .eq("is_active", true);

  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, passed")
    .eq("student_id", userId);

  const passedSet = new Set(progress?.filter((p) => p.passed).map((p) => p.lesson_id) ?? []);

  return units.map((unit, i) => {
    const unitLessons = lessons?.filter((l) => l.unit_id === unit.id) ?? [];
    const totalLessons = unitLessons.length;
    const completedLessons = unitLessons.filter((l) => passedSet.has(l.id)).length;

    // First unit always unlocked; others require ALL lessons in previous unit passed
    let unlocked = i === 0;
    if (i > 0) {
      const prevUnitLessons = lessons?.filter((l) => l.unit_id === units[i - 1].id) ?? [];
      unlocked = prevUnitLessons.length > 0 && prevUnitLessons.every((l) => passedSet.has(l.id));
    }

    return { ...unit, totalLessons, completedLessons, unlocked };
  });
}

export async function getLessonsWithProgress(
  supabase: SupabaseClient,
  userId: string,
  unitId: string
) {
  const { data: lessons } = await supabase
    .from("curriculum_lessons")
    .select("id, slug, title, description, lesson_type, sort_order, passing_score")
    .eq("unit_id", unitId)
    .eq("is_active", true)
    .order("sort_order");

  if (!lessons) return [];

  const { data: progress } = await supabase
    .from("student_progress")
    .select("lesson_id, score, total, passed, attempts")
    .eq("student_id", userId);

  const progressMap = new Map(progress?.map((p) => [p.lesson_id, p]) ?? []);

  return lessons.map((lesson, i) => {
    const prog = progressMap.get(lesson.id);
    let unlocked = i === 0;
    if (i > 0) {
      const prevProg = progressMap.get(lessons[i - 1].id);
      unlocked = prevProg?.passed ?? false;
    }

    return {
      ...lesson,
      unlocked,
      score: prog?.score ?? null,
      total: prog?.total ?? null,
      passed: prog?.passed ?? false,
      attempts: prog?.attempts ?? 0,
    };
  });
}
