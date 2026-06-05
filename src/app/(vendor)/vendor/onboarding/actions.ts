"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { AuthError } from "@/lib/errors";
import { onboardingSchema } from "@/lib/validators/vendor";
import {
  generateUniqueSlug,
  getVendorProfileByUserId,
  persistVendorOnboarding,
} from "@/services/vendor-onboarding";

// ── Return type ───────────────────────────────────────────────────────────────

type OnboardingError =
  | { ok: false; code: "AUTH_REQUIRED" }
  | { ok: false; code: "VALIDATION_ERROR"; fieldErrors: Record<string, string[]> }
  | { ok: false; code: "INTERNAL_ERROR"; message: string };

/**
 * Persists the vendor onboarding form data in a single transaction.
 *
 * vendorId is derived from the authenticated session — it is NEVER taken from
 * client input. This enforces the ownership invariant: a vendor cannot submit
 * on behalf of another vendor's profile.
 *
 * redirect() is called on success; this function never returns in the success
 * path. (BUG-002: redirect() inside a Server Action throws a special Next.js
 * redirect error that the framework converts to a client navigation. The declared
 * return type reflects the error branch only.)
 */
export async function submitOnboarding(rawData: unknown): Promise<OnboardingError> {
  // Invariant 6 — auth + role check before any logic runs.
  let user: Awaited<ReturnType<typeof requireRole>>;
  try {
    user = await requireRole("VENDOR");
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, code: "AUTH_REQUIRED" };
    console.error("[submitOnboarding] auth error:", err);
    return { ok: false, code: "INTERNAL_ERROR", message: "Authentication error. Please try again." };
  }

  // Invariant 5 — re-validate everything server-side; rawData is untrusted at this boundary.
  const parsed = onboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Look up existing profile from DB via the authenticated user's ID.
  // vendorId source is auth, not client input (invariant 6 / invariant 10).
  const existing = await getVendorProfileByUserId(user.id);
  const existingVendorId = existing?.id;

  const slug = await generateUniqueSlug(parsed.data.businessName, existingVendorId);

  try {
    await persistVendorOnboarding(user.id, existingVendorId, slug, parsed.data);
  } catch (err) {
    console.error("[submitOnboarding] DB error:", err);
    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Failed to save your application. Please try again.",
    };
  }

  // [EMAIL STUB] submission-received → vendor // TODO(Week3): wire Resend
  console.log(
    `[EMAIL STUB] vendor-onboarding-submitted → ${user.email} (${parsed.data.businessName}) // TODO(Week3): Resend`,
  );

  // Redirect to this page; the status router will show the Under Review state.
  redirect("/vendor/onboarding");
}
