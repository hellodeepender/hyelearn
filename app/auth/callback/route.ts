import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const LOCALE_DOMAINS: Record<string, string> = {
  el: "https://mathaino.net",
  hy: "https://hyelearn.com",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const host = request.headers.get("host")?.replace(/^www\./, "") || "";
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`https://hyelearn.com/login`);
  }

  // On a product domain — exchange code normally (PKCE cookie exists here)
  if (host === "hyelearn.com" || host === "mathaino.net") {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data?.user) {
      const locale = data.user.user_metadata?.locale || "hy";
      const domain = LOCALE_DOMAINS[locale] || origin;
      return NextResponse.redirect(`${domain}/login?confirmed=true`);
    }
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }

  // On diasporalearn.org — can't exchange code (no PKCE cookie)
  // Use admin API to find the latest unconfirmed user's locale
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    try {
      const db = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { persistSession: false } }
      );

      const { data: { users } } = await db.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (users && users.length > 0) {
        const latestUser = users[0];
        const locale = latestUser.user_metadata?.locale || "hy";
        const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
        console.log("DIASPORA_REDIRECT", JSON.stringify({ userId: latestUser.id, locale, domain }));
        return NextResponse.redirect(`${domain}/auth/callback?code=${code}`);
      }
    } catch (e) {
      console.error("ADMIN_LOOKUP_ERROR", e);
    }
  }

  return NextResponse.redirect(`https://hyelearn.com/auth/callback?code=${code}`);
}
