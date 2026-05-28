import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SiteNav } from "@/components/nav/SiteNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { FeaturedVendorsSection } from "@/components/landing/FeaturedVendorsSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { VendorCTASection } from "@/components/landing/VendorCTASection";
import { FooterSection } from "@/components/landing/FooterSection";
import type { VendorCardData } from "@/components/vendor/VendorCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "EventIQ — Verified Event Vendors in Lagos",
  },
  description:
    "Find and book verified caterers, decorators, and photographers for your next event. Escrow-backed payments. Real reviews. Lagos, Nigeria.",
};

// Computes the most common category across a vendor's active services.
// Falls back to the first portfolio item's category, then null.
function derivePrimaryCategory(
  services: Array<{ category: string }>,
  portfolioCategory: string | null | undefined,
): VendorCardData["primaryCategory"] {
  if (services.length === 0) {
    return (portfolioCategory as VendorCardData["primaryCategory"]) ?? null;
  }
  const counts = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  return (top?.[0] as VendorCardData["primaryCategory"]) ?? null;
}

export default async function HomePage() {
  const [vendorProfiles, categoryCounts] = await Promise.all([
    db.vendorProfile.findMany({
      where: { verificationStatus: "APPROVED" },
      take: 6,
      orderBy: [{ verifiedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        businessName: true,
        slug: true,
        city: true,
        bio: true,
        yearsOfExperience: true,
        portfolioItems: {
          take: 1,
          orderBy: { displayOrder: "asc" },
          select: { imageUrl: true, cloudinaryPublicId: true, category: true },
        },
        services: {
          where: { isActive: true },
          select: { priceKobo: true, category: true },
        },
      },
    }),
    Promise.all([
      db.vendorProfile.count({
        where: {
          verificationStatus: "APPROVED",
          services: { some: { category: "CATERING", isActive: true } },
        },
      }),
      db.vendorProfile.count({
        where: {
          verificationStatus: "APPROVED",
          services: { some: { category: "DECORATION", isActive: true } },
        },
      }),
      db.vendorProfile.count({
        where: {
          verificationStatus: "APPROVED",
          services: { some: { category: "PHOTOGRAPHY", isActive: true } },
        },
      }),
    ]),
  ]);

  const [cateringCount, decorationCount, photographyCount] = categoryCounts;

  // Derive display fields — all computation happens here, sections receive clean props.
  const vendors: VendorCardData[] = vendorProfiles.map((v) => {
    const prices = v.services.map((s) => s.priceKobo);
    const startingPriceKobo = prices.length > 0 ? Math.min(...prices) : null;

    return {
      businessName: v.businessName,
      slug: v.slug,
      city: v.city,
      bio: v.bio,
      yearsOfExperience: v.yearsOfExperience,
      startingPriceKobo,
      primaryCategory: derivePrimaryCategory(
        v.services,
        v.portfolioItems[0]?.category,
      ),
      coverImageUrl: v.portfolioItems[0]?.imageUrl ?? null,
    };
  });

  return (
    <>
      <SiteNav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <CategoriesSection
          cateringCount={cateringCount ?? 0}
          decorationCount={decorationCount ?? 0}
          photographyCount={photographyCount ?? 0}
        />
        <FeaturedVendorsSection vendors={vendors} />
        <TrustSection />
        <VendorCTASection />
      </main>
      <FooterSection />
    </>
  );
}
