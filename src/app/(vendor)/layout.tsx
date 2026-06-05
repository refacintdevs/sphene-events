import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { findCurrentUser } from "@/lib/auth";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  // DB role check — deliberately uses findCurrentUser() (read-only), NOT getCurrentUser().
  //
  // WHY NOT getCurrentUser(): setUserRole() redirects here immediately after writing VENDOR
  // to the DB, before the Clerk JWT has had time to refresh (BUG-014 propagation lag, up to
  // ~60s). getCurrentUser() calls ensureUser() as a side effect, which would create a DB row
  // with role=CUSTOMER if the JWT is stale — re-introducing BUG-011.
  //
  // findCurrentUser() reads the DB directly (invariant 8 — DB is source of truth) and returns
  // null for unauthenticated or missing rows without any creation side effect. (AD-010)
  //
  // WHY redirect('/') NOT notFound(): vendor onboarding is not a secret URL; a CUSTOMER
  // landing here by mistake should be returned to the homepage, not shown a 404.
  // Contrast with /admin, where notFound() hides the route's existence (feature-specs §12).
  const user = await findCurrentUser();
  if (!user || user.role !== "VENDOR") {
    redirect("/");
  }
  return <>{children}</>;
}
