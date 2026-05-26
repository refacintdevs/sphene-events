import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthError, DatabaseSyncError } from "@/lib/errors";
import { userSyncSchema } from "@/lib/validators/user";

/**
 * Finds or creates the DB User row for the given Clerk identity.
 * Called on every authenticated request — upsert is a no-op after the first hit.
 * Throws DatabaseSyncError if the DB write fails.
 */
export async function ensureUser(input: {
  clerkId: string;
  email: string;
  fullName: string;
}) {
  const parsed = userSyncSchema.safeParse(input);
  if (!parsed.success) {
    throw new DatabaseSyncError(
      `Invalid user sync data for clerkId=${input.clerkId}: ${parsed.error.message}`,
    );
  }

  try {
    return await db.user.upsert({
      where: { clerkId: parsed.data.clerkId },
      update: {},
      create: {
        clerkId: parsed.data.clerkId,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    throw new DatabaseSyncError(
      `Failed to sync user clerkId=${input.clerkId}`,
      { cause: error },
    );
  }
}

/**
 * Returns the DB User row for the currently signed-in Clerk session,
 * creating it on first access (lazy sync). Returns null if no session.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? "";

  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ");

  return ensureUser({ clerkId: userId, email, fullName });
}

/**
 * Like getCurrentUser(), but throws AuthError instead of returning null.
 * Use in server components or route handlers that require authentication.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required");
  return user;
}

/**
 * Like requireAuth(), but also checks the DB role.
 * Throws AuthError if the user's role does not match the required role.
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new AuthError(`Role '${role}' required, got '${user.role}'`);
  }
  return user;
}
