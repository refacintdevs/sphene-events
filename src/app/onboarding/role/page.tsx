import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { findCurrentUser } from "@/lib/auth";
import { RoleCards } from "./_components/RoleCards";

export const metadata: Metadata = {
  title: "Choose your role · EventIQ",
};

export default async function RoleSelectionPage() {
  // ── Tier 1: JWT fast path ─────────────────────────────────────────────────
  // auth() reads Clerk session JWT in memory — no network call, no DB hit.
  // For returning users whose JWT carries publicMetadata.role (set by a prior
  // successful setUserRole() → Clerk Admin SDK write), this redirects instantly.
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const jwtRole = (sessionClaims as { metadata?: { role?: string } } | null)
    ?.metadata?.role;

  if (jwtRole === "vendor") redirect("/"); // TODO Phase 1: /vendor/dashboard
  if (jwtRole === "admin") redirect("/admin");
  if (jwtRole === "customer") redirect("/");

  // ── Tier 2: DB authoritative path ─────────────────────────────────────────
  // JWT has no role: either a genuine first-time user OR a returning user
  // whose Clerk publicMetadata write previously failed (AD-004 known gap).
  //
  // Use findCurrentUser() — a READ-ONLY lookup that does NOT call ensureUser().
  // This preserves the invariant: a DB row only exists after the user has
  // explicitly called setUserRole() (which runs ensureUser() internally).
  // "No DB row" therefore means "brand-new user, has never picked a role."
  //
  // Do NOT use getCurrentUser() here — it calls ensureUser(), which would
  // create the DB row for new users before they pick a role, making
  // "no DB row" and "picked CUSTOMER" indistinguishable.
  const dbUser = await findCurrentUser();

  // Any DB row means the user has been through setUserRole() at least once.
  // Redirect based on the DB role — invariant 8: DB is source of truth.
  if (dbUser?.role === "ADMIN") redirect("/admin");
  if (dbUser) redirect("/"); // CUSTOMER or VENDOR → home (TODO Phase 1: vendor dashboard)

  // No DB row → genuine brand-new user who has never completed role selection.
  return (
    <div className="flex w-full max-w-2xl flex-col items-center text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Getting started
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
        Welcome to EventIQ
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        How will you use EventIQ? You can change this later by contacting
        support.
      </p>
      <RoleCards />
    </div>
  );
}
