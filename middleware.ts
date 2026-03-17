import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDomainConfig } from "@/config/domains";

export async function middleware(request: NextRequest) {
  // ── Locale detection ──────────────────────────────────────
  const hostname = request.headers.get("host") || "hyelearn.com";
  const domainConfig = getDomainConfig(hostname);

  // Set locale on the REQUEST headers so server components can read them
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", domainConfig.locale);
  requestHeaders.set("x-brand-name", domainConfig.brandName);
  requestHeaders.set("x-domain", hostname.split(":")[0]);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // ── Supabase auth (unchanged) ─────────────────────────────
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
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          });
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

  // ── Attach locale cookie for client components ────────────
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
