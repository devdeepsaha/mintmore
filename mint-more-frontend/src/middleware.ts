import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware strategy:
 *
 * JWT tokens are in localStorage — inaccessible at the Edge.
 * We use a lightweight `mm_session` cookie that contains ONLY the user's role
 * (base64 encoded JSON: { role: 'admin'|'client'|'freelancer' }).
 *
 * This cookie is SET by the authStore.login() action (client-side).
 * It is CLEARED by the authStore.logout() action (client-side).
 *
 * The middleware uses this cookie to:
 * 1. Redirect unauthenticated users to /login
 * 2. Redirect wrong-role users to their correct dashboard
 * 3. Redirect authenticated users away from auth pages
 *
 * Real auth enforcement happens on every API call (backend validates JWT).
 * This middleware is a UX guard, not a security boundary.
 */

const PUBLIC_PATHS = new Set([
  "/",
  "/how-it-works",
  "/for-businesses",
  "/for-freelancers",
  "/pricing",
]);
const AUTH_PATHS = new Set(["/login", "/register"]);
const ADMIN_SECRET_PATH = "/admin-access";

const ROLE_PREFIXES = {
  "/client": "client",
  "/freelancer": "freelancer",
  "/admin": "admin",
} as const;

type Role = "admin" | "client" | "freelancer";

const ROLE_DASHBOARDS: Record<Role, string> = {
  admin: "/admin",
  client: "/client",
  freelancer: "/freelancer",
};

const parseSession = (cookie: string | undefined): { role?: Role } | null => {
  if (!cookie) return null;
  try {
    const decoded = Buffer.from(cookie, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (
      parsed.role &&
      ["admin", "client", "freelancer"].includes(parsed.role)
    ) {
      return parsed as { role: Role };
    }
    return null;
  } catch {
    return null;
  }
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, static files, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("mm_session")?.value;
  const session = parseSession(sessionCookie);
  const role = session?.role ?? null;
  const isAuthenticated = !!role;

  // ── Public marketing pages ─────────────────────────────────────────────
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // ── Admin secret login ─────────────────────────────────────────────────
  if (pathname === ADMIN_SECRET_PATH) {
    if (isAuthenticated && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── Auth pages (login, register) ──────────────────────────────────────
  // Always allow access to login/register — page handles stale session cleanup
  if (AUTH_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // ── Protected routes ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Role enforcement ───────────────────────────────────────────────────
  for (const [prefix, requiredRole] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) {
      if (role !== requiredRole) {
        // Wrong role — redirect to correct dashboard silently
        return NextResponse.redirect(
          new URL(ROLE_DASHBOARDS[role!], request.url),
        );
      }
      return NextResponse.next();
    }
  }

  // Unknown protected path — let it through (404 will handle it)
  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|icons|fonts|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)",
  ],
};
