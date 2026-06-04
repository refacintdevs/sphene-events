import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/vendors(.*)", // browse + detail pages — public; covers Units 1.2 and 1.3
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Admin routes are gated at two layers (defense in depth):
// 1. Here in the proxy: reads Clerk publicMetadata.role from the session JWT (fast, no DB call).
//    Non-admins receive a 404 — not a redirect, not a 403 — to hide the existence of /admin.
// 2. In (admin)/layout.tsx: re-checks against the DB (source of truth, invariant 10).
//
// Note on AD-004 staleness: admin role is only ever set manually via the Clerk dashboard.
// It is never set programmatically, so the JWT staleness window that applies to customer/vendor
// role changes after setUserRole() does NOT apply here. The two-layer check is defense in depth,
// not a workaround for staleness.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Onboarding gate: any authenticated user who already has a role in their JWT should be
// redirected away from /onboarding/role before the page ever renders.
//
// WHY the proxy and not page.tsx: a redirect() called from inside a Next.js Server Component
// is delivered as an RSC-embedded redirect instruction (HTTP 200 with a redirect payload) when
// the request arrives as a client-side RSC fetch (e.g. Clerk's post-sign-in router.push).
// This RSC redirect can fail to navigate cleanly on first post-auth load, leaving the browser
// stuck on a blank /onboarding/role URL. NextResponse.redirect() in the proxy runs before any
// page code and is always a real HTTP redirect (3xx) that the browser follows unconditionally,
// whether the request is a full page load or an RSC fetch.
//
// Users with no role in their JWT are let through — page.tsx Tier 2 (DB check via
// findCurrentUser) handles the stale-JWT / brand-new-user distinction without delivery issues,
// because it only fires when the user truly reaches the role-selection page. (AD-009)
const isOnboardingRoleRoute = createRouteMatcher(["/onboarding/role"]);

export default clerkMiddleware(async (auth, request) => {
  // ── 1. Admin gate (Layer 1 of AD-008 two-layer gating) ──────────────────────
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth();
    const role = (sessionClaims as { metadata?: { role?: string } } | null)
      ?.metadata?.role;
    if (role !== "admin") {
      // Return 404, not 403, to hide the existence of admin routes (feature-specs §12).
      return new NextResponse(null, { status: 404 });
    }
    return; // Admin — let through to the route group layout for DB re-check.
  }

  // ── 2. Onboarding gate (AD-009) ──────────────────────────────────────────────
  if (isOnboardingRoleRoute(request)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      // Not signed in — send to sign-in with redirect back to onboarding.
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const role = (sessionClaims as { metadata?: { role?: string } } | null)
      ?.metadata?.role;

    // JWT carries a role → user has already completed onboarding. Redirect now,
    // before the page renders, via a real HTTP redirect (not an RSC payload redirect).
    if (role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    if (role) return NextResponse.redirect(new URL("/", request.url)); // "customer" or "vendor"

    // No role in JWT: either a genuine first-time user or a returning user whose
    // Clerk publicMetadata write failed (AD-004 known gap — JWT is stale).
    // Let through to page.tsx, which checks the DB (findCurrentUser) as fallback.
    return;
  }

  // ── 3. General auth gate ─────────────────────────────────────────────────────
  // Protect all non-public routes. Unauthenticated requests are redirected to sign-in.
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
