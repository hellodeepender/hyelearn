import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const origin = request.nextUrl.origin;

  console.log("CALLBACK_START", JSON.stringify({ code: code?.substring(0, 8), origin }));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("CALLBACK_EXCHANGE", JSON.stringify({
      userId: data?.user?.id,
      session: !!data?.session,
      error: error?.message,
      locale: data?.user?.user_metadata?.locale,
    }));

    if (data?.user) {
      const locale = data.user.user_metadata?.locale || "hy";
      const LOCALE_DOMAINS: Record<string, string> = {
        el: "https://mathaino.net",
        hy: "https://hyelearn.com",
      };
      const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
      return NextResponse.redirect(`${domain}/login?confirmed=true`);
    }
  }

  return NextResponse.redirect(`https://hyelearn.com/login`);
}
