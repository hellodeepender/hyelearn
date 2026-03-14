import type { SupabaseClient } from "@supabase/supabase-js";

interface Subscription {
  id: string;
  status: string;
  plan: { slug: string; ai_sessions_limit: number; features: Record<string, unknown> };
  current_period_end: string | null;
}

export async function getUserSubscription(
  db: SupabaseClient,
  userId: string
): Promise<Subscription | null> {
  const { data } = await db
    .from("subscriptions")
    .select("id, status, current_period_end, plans!inner(slug, ai_sessions_limit, features)")
    .eq("user_id", userId)
    .in("status", ["active", "trial", "gift"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  const plan = data.plans as unknown as { slug: string; ai_sessions_limit: number; features: Record<string, unknown> };
  return {
    id: data.id,
    status: data.status,
    plan,
    current_period_end: data.current_period_end,
  };
}

export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (!["active", "trial", "gift"].includes(sub.status)) return false;
  if (sub.current_period_end && new Date(sub.current_period_end) < new Date()) return false;
  return true;
}

export async function canAccessCurriculum(
  db: SupabaseClient,
  userId: string,
  lessonSortOrder: number
): Promise<{ allowed: boolean; reason?: string }> {
  const sub = await getUserSubscription(db, userId);
  if (!sub || !isSubscriptionActive(sub)) {
    // Free tier: first lesson of every unit
    if (lessonSortOrder <= 1) return { allowed: true };
    return { allowed: false, reason: "upgrade" };
  }
  return { allowed: true };
}

export async function canUseAIPractice(
  db: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; remaining?: number; reason?: string }> {
  const sub = await getUserSubscription(db, userId);
  const limit = sub?.plan?.ai_sessions_limit ?? 3;

  // Unlimited
  if (limit === -1) return { allowed: true, remaining: -1 };

  // Check daily usage
  const today = new Date().toISOString().split("T")[0];
  const { data: usage } = await db
    .from("ai_usage")
    .select("sessions_used")
    .eq("user_id", userId)
    .eq("session_date", today)
    .single();

  const used = usage?.sessions_used ?? 0;
  if (used >= limit) {
    return { allowed: false, remaining: 0, reason: "limit_reached" };
  }
  return { allowed: true, remaining: limit - used };
}

export async function trackAIUsage(db: SupabaseClient, userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Try to get current count
  const { data: existing } = await db
    .from("ai_usage")
    .select("id, sessions_used")
    .eq("user_id", userId)
    .eq("session_date", today)
    .single();

  if (existing) {
    await db.from("ai_usage")
      .update({ sessions_used: existing.sessions_used + 1 })
      .eq("id", existing.id);
  } else {
    await db.from("ai_usage").insert({
      user_id: userId,
      session_date: today,
      sessions_used: 1,
    });
  }
}
