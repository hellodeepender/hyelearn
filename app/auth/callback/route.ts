import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const LOCALE_DOMAINS: Record<string, string> = {
  hy: "https://hyelearn.com",
  el: "https://mathaino.net",
  ar: "https://ta3allam.org",
};

// Product domains where PKCE cookie exists and code can be exchanged
const PRODUCT_HOSTS = new Set(["hyelearn.com", "mathaino.net", "ta3allam.org"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const host = request.headers.get("host")?.replace(/^www\./, "") || "";
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // On a product domain — exchange code normally (PKCE cookie exists here)
  if (PRODUCT_HOSTS.has(host)) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data?.user) {
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }

  // On diasporalearn.org — can't exchange code (no PKCE cookie)
  // Use admin API to find the latest unconfirmed user's locale and redirect to their domain
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
        const domain = LOCALE_DOMAINS[locale] || LOCALE_DOMAINS.hy;
        return NextResponse.redirect(`${domain}/auth/callback?code=${code}`);
      }
    } catch {
    }
  }

  return NextResponse.redirect(`${LOCALE_DOMAINS.hy}/auth/callback?code=${code}`);
}
