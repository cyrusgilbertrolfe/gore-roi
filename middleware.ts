import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "roi_auth";
const COOKIE_TTL_SECONDS = 60 * 60 * 8; // 8 hours — fits a session day

function isAllowedPath(pathname: string) {
  if (pathname.startsWith("/_next")) return true;
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }
  // Any path with a file extension (logos, images, etc.) — keep these always reachable
  // so they render on the unauthenticated landing page.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (isAllowedPath(pathname)) return NextResponse.next();

  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    // Production: fail closed — better a 503 than an open Gore-branded page.
    // Development: fail open — keeps local dev frictionless.
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse(
      "Site is not configured. SITE_PASSWORD is missing.",
      { status: 503 }
    );
  }

  // Always allow the home page through — it renders the login UI.
  if (pathname === "/") return NextResponse.next();

  // Logout: clear the cookie and bounce to home.
  if (pathname === "/logout") {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return res;
  }

  // Already authenticated?
  if (req.cookies.get(COOKIE_NAME)?.value === "1") {
    return NextResponse.next();
  }

  // Password submission: /auth?pw=...&next=/...
  if (pathname === "/auth") {
    const pw = searchParams.get("pw") ?? "";
    const next = searchParams.get("next") ?? "/";

    if (pw === sitePassword) {
      const res = NextResponse.redirect(new URL(next, req.url));
      res.cookies.set(COOKIE_NAME, "1", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_TTL_SECONDS,
      });
      return res;
    }

    // Wrong password — bounce home with the error flag and preserve the original `next`.
    const url = new URL("/", req.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  // Not authenticated, not the auth/home routes — send them home with a `next` to come back to.
  const url = new URL("/", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /**
     * Apply to everything except Next internals and files with extensions
     * (these are gated by isAllowedPath above too, but the matcher saves the
     * middleware function call entirely).
     */
    "/((?!_next/|.*\\..*).*)",
  ],
};
