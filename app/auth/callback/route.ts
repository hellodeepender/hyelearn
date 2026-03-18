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

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const userId = data?.user?.id;

    if (userId) {
      // Use service role to read user metadata (bypasses any cookie/session issues)
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        const db = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey,
          { auth: { persistSession: false } }
        );
        const { data: authUser } = await db.auth.admin.getUserById(userId);
        const locale = authUser?.user?.user_metadata?.locale || "hy";
        const domain = LOCALE_DOMAINS[locale] || "https://hyelearn.com";
        console.log("CALLBACK_DEBUG", JSON.stringify({ userId, locale, domain }));
        return NextResponse.redirect(`${domain}/login?confirmed=true`);
      }
    }
  }

  return NextResponse.redirect(`https://hyelearn.com/login`);
}
