import { NextResponse, type NextRequest } from "next/server";

/**
 * Site-wide HTTP Basic Auth.
 *
 * - Set `SITE_PASSWORD` in Vercel (and locally in .env.local for development).
 * - Username is ignored — type anything; only the password is checked.
 * - Static assets and the public/logos folder are matched but allowed without
 *   auth headers because matching the matcher excludes _next/static and the
 *   logo paths via the matcher pattern below.
 *
 * In production: missing SITE_PASSWORD returns 503 (fail closed).
 * In development: missing SITE_PASSWORD allows access (preserves DX).
 */

const REALM = 'Gore + Kezzler ROI Calculator';

export function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.next();
    }
    return new NextResponse(
      'Site is not configured. SITE_PASSWORD is missing.',
      { status: 503 }
    );
  }

  const header = req.headers.get('authorization');
  if (header) {
    const [scheme, encoded] = header.split(' ');
    if (scheme === 'Basic' && encoded) {
      try {
        const decoded = atob(encoded);
        const colonIdx = decoded.indexOf(':');
        const submitted =
          colonIdx === -1 ? decoded : decoded.slice(colonIdx + 1);
        if (submitted === password) {
          return NextResponse.next();
        }
      } catch {
        // fall through to 401
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match every path except:
     *   - /_next/static     (build assets)
     *   - /_next/image      (next/image optimizer)
     *   - /favicon.ico
     *   - /logos/...        (Gore + Kezzler logos referenced from the auth challenge page itself)
     */
    '/((?!_next/static|_next/image|favicon.ico|logos/).*)',
  ],
};
