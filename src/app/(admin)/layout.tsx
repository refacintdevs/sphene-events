import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Layer 2 DB re-check (defense in depth — proxy is layer 1).
  // Admin role is only set manually in Clerk dashboard, never programmatically,
  // so AD-004 staleness does not apply. This re-check ensures our DB is the
  // source of truth even if someone fabricates a session token.
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-secondary/10 px-6">
          <span className="font-display text-sm font-semibold text-secondary">
            EventIQ Admin
          </span>
          <span className="ml-3 rounded-md bg-secondary/20 px-2 py-0.5 text-xs font-medium text-secondary">
            {user.email}
          </span>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
