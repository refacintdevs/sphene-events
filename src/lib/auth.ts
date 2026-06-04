import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthError, DatabaseSyncError } from "@/lib/errors";
import { userSyncSchema } from "@/lib/validators/user";

/**
 * Finds or creates the DB User row for the given Clerk identity.
 *
 * Normal path: upsert by clerkId. update:{} is intentionally empty — never
 * clobbers role or other user-set fields on re-auth (invariant 8 / AD-004).
 *
 * Email-collision path: if a Clerk account was deleted and the same email
 * re-used to create a new account, Clerk issues a new clerkId. The upsert
 * finds no row by the new clerkId → tries CREATE → P2002 on email. We recover
 * by updating the existing row's clerkId to the new one. Role and all other
 * fields are preserved — Clerk is the identity authority for the clerkId;
 * the DB is the source of truth for everything else (AD-004).
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
      update: {}, // Intentionally empty — do NOT reset role on re-auth.
      create: {
        clerkId: parsed.data.clerkId,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        role: "CUSTOMER",
      },
    });
  } catch (firstError) {
    // Check for P2002 unique constraint violation on email.
    // This happens when a Clerk user was deleted and re-created with the same
    // email. The old DB row still has that email under the old (now invalid)
    // clerkId. Transfer the clerkId to the new account; preserve all other
    // fields including role (so a manually-set ADMIN row survives the transfer).
    if (
      firstError instanceof Prisma.PrismaClientKnownRequestError &&
      firstError.code === "P2002"
    ) {
      console.warn(
        `[ensureUser] Email collision for ${parsed.data.email} — transferring clerkId to new Clerk account. ` +
          `Old Clerk account was likely deleted and email re-used.`,
      );
      try {
        return await db.user.update({
          where: { email: parsed.data.email },
          data: { clerkId: parsed.data.clerkId },
          // Role and all other fields are left unchanged.
        });
      } catch (reconcileError) {
        throw new DatabaseSyncError(
          `Failed to reconcile user identity for email=${parsed.data.email}`,
          { cause: reconcileError },
        );
      }
    }

    throw new DatabaseSyncError(
      `Failed to sync user clerkId=${input.clerkId}`,
      { cause: firstError },
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
 * Read-only lookup of the DB User row for the current Clerk session.
 *
 * Unlike getCurrentUser(), this does NOT call ensureUser() — it returns null
 * for an authenticated Clerk user who has no DB row yet (i.e. a brand-new user
 * who has not yet completed role selection). The DB row is only ever created
 * inside setUserRole() → requireAuth() → ensureUser().
 *
 * Use this when "no DB row" must be distinguishable from "has a DB row"
 * without triggering the creation side-effect.
 */
export async function findCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({ where: { clerkId: userId } });
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
