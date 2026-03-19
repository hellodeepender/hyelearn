import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase-server";
import { canUseAIPractice } from "@/lib/access";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ remaining: 0 });

  const access = await canUseAIPractice(supabase, user.id);
  return NextResponse.json({ remaining: access.remaining ?? 0 });
}
