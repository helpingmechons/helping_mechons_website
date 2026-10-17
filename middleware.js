import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  // ── Add security headers to every response ──────────────────────────────────
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // ────────────────────────────────────────────────────────────────────────────

  const path = request.nextUrl.pathname;
  const isAuthPage   = ["/login", "/signup", "/forgot-password"].some(p => path.startsWith(p));
  const isProtected  = path.startsWith("/profile") || path.startsWith("/admin");
  const isAdminRoute = path.startsWith("/admin");

  // ── Fast path for anonymous visitors (most of our traffic) ───────────────────
  // No Supabase auth cookie means there is no session to validate or refresh,
  // so skip the network round-trip to Supabase on every page view. Logged-in
  // users still go through the full getUser() check below.
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith("sb-") && c.name.includes("-auth-token"));
  if (!hasSession) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Use getUser() — validates token server-side, never trusts client-side state
  const { data: { user } } = await supabase.auth.getUser();

  // ── Block unauthenticated access to protected pages ──────────────────────────
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from auth pages ────────────────────────────
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // ── Admin guard — verify role in DB every request, not just in JWT ───────────
  if (isAdminRoute && user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .single();

    // If DB fetch fails or role isn't admin → deny silently
    if (error || !profile || profile.role !== "admin") {
      // Redirect to home — don't give attacker information about the admin panel
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Force password change before accessing any admin page
    if (
      profile.must_change_password &&
      !path.startsWith("/admin/change-password")
    ) {
      return NextResponse.redirect(new URL("/admin/change-password", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Cover all routes except static assets and image files
    "/((?!_next/static|_next/image|favicon.ico|photos|icons|brand|api/public|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico)$).*)",
  ],
};
