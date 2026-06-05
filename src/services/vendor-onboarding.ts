import { db } from "@/lib/db";
import type { ParsedOnboarding } from "@/lib/validators/vendor";

// ── Slug generation ───────────────────────────────────────────────────────────

function toBaseSlug(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || "vendor";
}

/** Returns a slug that is unique in the VendorProfile table. Appends -2, -3… on collision. */
export async function generateUniqueSlug(
  businessName: string,
  excludeVendorId?: string,
): Promise<string> {
  const base = toBaseSlug(businessName);
  let slug = base;
  let n = 2;
  for (;;) {
    const hit = await db.vendorProfile.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!hit || hit.id === excludeVendorId) return slug;
    slug = `${base}-${n}`;
    n++;
  }
}

// ── Profile lookup ────────────────────────────────────────────────────────────

export type VendorOnboardingProfile = {
  id: string;
  businessName: string;
  slug: string;
  bio: string;
  address: string;
  whatsappNumber: string;
  instagramHandle: string | null;
  cacNumber: string | null;
  yearsOfExperience: number;
  primaryCategory: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  verificationStatus: string;
  verificationNotes: string | null;
};

export async function getVendorProfileByUserId(
  userId: string,
): Promise<VendorOnboardingProfile | null> {
  return db.vendorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      businessName: true,
      slug: true,
      bio: true,
      address: true,
      whatsappNumber: true,
      instagramHandle: true,
      cacNumber: true,
      yearsOfExperience: true,
      primaryCategory: true,
      bankName: true,
      bankAccountNumber: true,
      bankAccountName: true,
      verificationStatus: true,
      verificationNotes: true,
    },
  });
}

// ── Submission transaction ────────────────────────────────────────────────────

/**
 * Persists a vendor onboarding submission in a single Prisma transaction.
 *
 * First submission (existingVendorId = undefined): creates the VendorProfile.
 * Resubmit (existingVendorId set): updates the profile, replaces all existing
 * VerificationDocument and PortfolioItem rows.
 *
 * NOTE (MVP limitation): on resubmit, ALL portfolio items for this vendor are
 * deleted and replaced. Any items added outside of onboarding (future Unit 3.x
 * portfolio management) would also be removed. A separate "source" flag on
 * PortfolioItem would be needed to avoid this; deferred.
 */
export async function persistVendorOnboarding(
  userId: string,
  existingVendorId: string | undefined,
  slug: string,
  data: ParsedOnboarding,
): Promise<{ vendorId: string }> {
  return db.$transaction(async (tx) => {
    let vendorId: string;

    if (existingVendorId) {
      vendorId = existingVendorId;

      // Remove stale docs and portfolio before inserting the fresh set.
      await tx.verificationDocument.deleteMany({ where: { vendorId } });
      await tx.portfolioItem.deleteMany({ where: { vendorId } });

      await tx.vendorProfile.update({
        where: { id: vendorId },
        data: {
          businessName:       data.businessName,
          slug,
          bio:                data.bio,
          cacNumber:          data.cacNumber ?? null,
          whatsappNumber:     data.whatsappNumber,
          instagramHandle:    data.instagramHandle ?? null,
          address:            data.address,
          yearsOfExperience:  data.yearsOfExperience,
          primaryCategory:    data.primaryCategory,
          bankName:           data.bankName,
          bankAccountNumber:  data.bankAccountNumber,
          bankAccountName:    data.bankAccountName,
          verificationStatus: "PENDING",
          verificationNotes:  null,  // clear admin's previous note on resubmit
          verifiedAt:         null,
        },
      });
    } else {
      const profile = await tx.vendorProfile.create({
        data: {
          userId,
          businessName:       data.businessName,
          slug,
          bio:                data.bio,
          cacNumber:          data.cacNumber ?? null,
          whatsappNumber:     data.whatsappNumber,
          instagramHandle:    data.instagramHandle ?? null,
          city:               "Lagos",
          state:              "LAGOS",
          address:            data.address,
          yearsOfExperience:  data.yearsOfExperience,
          primaryCategory:    data.primaryCategory,
          bankName:           data.bankName,
          bankAccountNumber:  data.bankAccountNumber,
          bankAccountName:    data.bankAccountName,
          verificationStatus: "PENDING",
        },
      });
      vendorId = profile.id;
    }

    // Government ID (always) + CAC certificate (when provided) — one round-trip.
    await tx.verificationDocument.createMany({
      data: [
        {
          vendorId,
          type:               "GOVERNMENT_ID" as const,
          cloudinaryPublicId: data.governmentId.publicId,
          fileUrl:            data.governmentId.url,
          fileName:           data.governmentId.fileName,
        },
        ...(data.cacCertificate
          ? [
              {
                vendorId,
                type:               "CAC_CERTIFICATE" as const,
                cloudinaryPublicId: data.cacCertificate.publicId,
                fileUrl:            data.cacCertificate.url,
                fileName:           data.cacCertificate.fileName,
              },
            ]
          : []),
      ],
    });

    // Portfolio items — written as PortfolioItem rows so they appear on the
    // public /vendors/[slug] page after approval. One round-trip for all items.
    await tx.portfolioItem.createMany({
      data: data.portfolioItems.map((item, i) => ({
        vendorId,
        cloudinaryPublicId: item.publicId,
        imageUrl:           item.url,
        caption:            null,
        category:           data.primaryCategory,
        displayOrder:       i,
      })),
    });

    return { vendorId };
  // timeout raised to 15 s — guards against P2028 on a cold Neon WebSocket
  // connection when a max (5-image) submission is being written.
  }, { timeout: 15000 });
}
