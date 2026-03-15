import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);

    if (user) {
      // Determine redirect based on role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

      if (profile?.role === "teacher" || profile?.role === "admin") {
        return NextResponse.redirect(`${origin}/teacher`);
      }
      return NextResponse.redirect(`${origin}/student`);
    }
  }

  // Fallback: redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
