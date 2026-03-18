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

  // If we're on a product domain (hyelearn.com or mathaino.net), exchange normally
  if (host === "hyelearn.com" || host === "mathaino.net") {
    if (code) {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
    }
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}/login?confirmed=true`);
  }

  // If we're on diasporalearn.org, we can't exchange (PKCE cookie is on another domain)
  // Look up the user by the verification token to find their locale, then redirect with the code
  if (code) {
    try {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const db = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          { auth: { persistSession: false } }
        );
        // Get the most recently created unconfirmed user to determine locale
        const { data } = await db
          .from("profiles")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.id) {
          const { data: authUser } = await db.auth.admin.getUserById(data.id);
          const locale = authUser?.user?.user_metadata?.locale || "hy";
          const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
          // Redirect to the correct domain WITH the code so PKCE exchange works there
          return NextResponse.redirect(`${domain}/auth/callback?code=${code}`);
        }
      }
    } catch (e) {
      console.error("CALLBACK_LOCALE_LOOKUP_ERROR", e);
    }

    // Fallback: send to hyelearn with the code
    return NextResponse.redirect(`https://hyelearn.com/auth/callback?code=${code}`);
  }

  return NextResponse.redirect(`https://hyelearn.com/login`);
}
