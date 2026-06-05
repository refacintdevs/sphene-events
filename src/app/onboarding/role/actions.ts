"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { AuthError } from "@/lib/errors";

const roleSchema = z.enum(["CUSTOMER", "VENDOR"]);

type SetRoleError = {
  ok: false;
  code: "AUTH_REQUIRED" | "INTERNAL_ERROR";
};

export async function setUserRole(
  role: "CUSTOMER" | "VENDOR",
): Promise<SetRoleError> {
  // Validate input — guards against ADMIN or any other unexpected value
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) {
    console.error("[setUserRole] Invalid role value received", { role });
    return { ok: false, code: "INTERNAL_ERROR" };
  }

  // Auth check
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, code: "AUTH_REQUIRED" };
    }
    console.error("[setUserRole] Unexpected auth error", error);
    return { ok: false, code: "INTERNAL_ERROR" };
  }

  // Step 1: DB write — source of truth
  try {
    await db.user.update({
      where: { id: user.id },
      data: { role: parsed.data },
    });
  } catch (error) {
    console.error("[setUserRole] DB write failed", { userId: user.id, error });
    return { ok: false, code: "INTERNAL_ERROR" };
  }

  // Step 2: Clerk metadata — mirror only. Log failure, do not roll back DB.
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(user.clerkId, {
      publicMetadata: { role: parsed.data.toLowerCase() },
    });
  } catch (error) {
    console.error(
      "[setUserRole] Clerk metadata sync failed — DB is updated, Clerk is stale. Re-sync required.",
      { clerkId: user.clerkId, error },
    );
    // Do NOT return an error here. DB is the source of truth.
    // The proxy will use DB role for authorization once role-gated routes land (Unit 7).
  }

  if (parsed.data === "VENDOR") {
    redirect("/vendor/onboarding");
  }
  redirect("/");
}
