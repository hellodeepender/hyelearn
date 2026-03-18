import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const LOCALE_DOMAINS: Record<string, string> = {
  el: "https://mathaino.net",
  hy: "https://hyelearn.com",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Fetch user separately since exchangeCodeForSession may not return user data
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const locale = user.user_metadata?.locale || "hy";
      const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
      return NextResponse.redirect(`${domain}/login?confirmed=true`);
    }
  }

  return NextResponse.redirect(`https://hyelearn.com/login`);
}
