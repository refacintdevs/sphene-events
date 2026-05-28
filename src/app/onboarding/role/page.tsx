import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { RoleCards } from "./_components/RoleCards";

export const metadata: Metadata = {
  title: "Choose your role · EventIQ",
};

export default async function RoleSelectionPage() {
  // currentUser() makes a fresh API call — always accurate even right after
  // publicMetadata was mutated by setUserRole(). Do not use auth() here;
  // it reads cached JWT claims which won't reflect a metadata update until
  // the session token refreshes.
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // If publicMetadata.role is already set, the user has explicitly chosen.
  // Admins (role = "admin") are also redirected away — Zod blocks ADMIN input
  // in the action, so this page is purely a UX skip for returning users.
  const existingRole = clerkUser.publicMetadata?.role;
  if (existingRole) {
    redirect("/");
  }

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
