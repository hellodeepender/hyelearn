import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDomainConfig } from "@/config/domains";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // ── Locale detection ──────────────────────────────────────
  const hostname = request.headers.get("host") || "hyelearn.com";
  const domainConfig = getDomainConfig(hostname);

  // ── Supabase auth (unchanged from original) ───────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes: dashboard and practice pages
  const isProtected =
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/account");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Attach locale to response ─────────────────────────────
  supabaseResponse.headers.set("x-locale", domainConfig.locale);
  supabaseResponse.headers.set("x-brand-name", domainConfig.brandName);
  supabaseResponse.headers.set("x-domain", hostname.split(":")[0]);

  supabaseResponse.cookies.set("locale", domainConfig.locale, {
    path: "/",
    sameSite: "lax",
  });

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
