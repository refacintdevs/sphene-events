import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { findCurrentUser } from "@/lib/auth";

// AD-010: layouts always use findCurrentUser() (read-only DB lookup, no upsert
// side effects). getCurrentUser() would call ensureUser() and create rows.
export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const user = await findCurrentUser();
  if (!user || user.role !== "CUSTOMER") {
    redirect("/");
  }
  return <>{children}</>;
}
