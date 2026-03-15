import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

function getDb(authClient: Awaited<ReturnType<typeof createServerClient>>) {
  const sk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return sk ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, sk, { auth: { persistSession: false, autoRefreshToken: false } }) : authClient;
}

export async function GET() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb(authClient);
  const { data } = await db
    .from("parent_children")
    .select("child_id, profiles!parent_children_child_id_fkey(id, full_name, grade_level, grade_level_id, subscription_tier)")
    .eq("parent_id", user.id);

  const children = (data ?? []).map((r) => r.profiles);
  return NextResponse.json({ children });
}

export async function POST(request: NextRequest) {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { firstName, gradeValue } = await request.json() as { firstName: string; gradeValue: string };
  if (!firstName?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const db = getDb(authClient);

  // Check child limit (free: 1, family: 3)
  const { data: parentProfile } = await db.from("profiles").select("subscription_tier").eq("id", user.id).single();
  const tier = parentProfile?.subscription_tier ?? "free";
  const maxChildren = tier === "free" ? 1 : 3;

  const { count: existing } = await db.from("parent_children").select("id", { count: "exact", head: true }).eq("parent_id", user.id);
  if ((existing ?? 0) >= maxChildren) {
    return NextResponse.json({ error: `Maximum ${maxChildren} child profile${maxChildren > 1 ? "s" : ""} for your plan` }, { status: 400 });
  }

  // Find grade level
  const { data: level } = await db.from("curriculum_levels").select("id").eq("grade_value", gradeValue).single();

  // Create child profile (shares parent's auth)
  const { data: child, error: childErr } = await db.from("profiles").insert({
    id: crypto.randomUUID(),
    full_name: firstName.trim(),
    role: "student",
    grade_level: gradeValue === "K" ? 0 : Number(gradeValue),
    grade_level_id: level?.id ?? null,
    parent_id: user.id,
    subscription_tier: tier === "free" ? "free" : tier,
  }).select("id, full_name, grade_level").single();

  if (childErr) return NextResponse.json({ error: childErr.message }, { status: 500 });

  // Link parent-child
  await db.from("parent_children").insert({ parent_id: user.id, child_id: child.id });

  return NextResponse.json({ child });
}
