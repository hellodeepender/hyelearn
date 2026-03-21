import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data, error } = await db
    .from("donations")
    .select("donor_name, created_at, message")
    .eq("show_name", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[api/supporters] Query error:", error.message, error.details, error.hint);
  }

  const supporters = (data ?? []).map((d) => ({
    name: d.donor_name,
    date: new Date(d.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    message: d.message,
  }));

  return NextResponse.json(supporters, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
