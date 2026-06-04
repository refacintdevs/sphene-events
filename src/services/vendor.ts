import { db } from "@/lib/db";
import type {
  VendorSearchParams,
  VendorCategory,
} from "@/lib/validators/vendor-search";

// ── Vendor Detail types ──────────────────────────────────────────────────────

export interface ServiceItem {
  id: string;
  category: VendorCategory;
  title: string;
  description: string;
  priceKobo: number;
  durationHours: number | null;
  servesUpTo: number | null;
}

export interface PortfolioItemData {
  id: string;
  imageUrl: string;
  caption: string | null;
}

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  reviewerName: string;
  createdAt: Date;
}

export interface VendorDetail {
  id: string;
  businessName: string;
  slug: string;
  bio: string;
  city: string;
  yearsOfExperience: number;
  instagramHandle: string | null;
  hasCac: boolean;
  primaryCategory: VendorCategory | null;
  coverImageUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
  services: ServiceItem[];
  portfolioItems: PortfolioItemData[];
  reviews: ReviewItem[];
}

const PAGE_SIZE = 20;

export interface VendorBrowseItem {
  id: string;
  businessName: string;
  slug: string;
  city: string;
  bio: string;
  yearsOfExperience: number;
  startingPriceKobo: number | null;
  primaryCategory: VendorCategory | null;
  coverImageUrl: string | null;
  avgRating: number | null;
  reviewCount: number;
}

export interface SearchVendorsResult {
  vendors: VendorBrowseItem[];
  total: number;
  page: number;
  totalPages: number;
}

// Phase 2: push sort/aggregates/price-band into the DB or a search index.
// App-side is fast enough at seed scale (~10–15 vendors).
export async function searchVendors(
  filters: VendorSearchParams,
): Promise<SearchVendorsResult> {
  const rawVendors = await db.vendorProfile.findMany({
    where: {
      verificationStatus: "APPROVED",
      user: { isSuspended: false },
      services: {
        some: {
          isActive: true,
          ...(filters.category.length > 0
            ? { category: { in: filters.category } }
            : {}),
        },
      },
      ...(filters.q
        ? {
            OR: [
              {
                businessName: {
                  contains: filters.q,
                  mode: "insensitive",
                },
              },
              { bio: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.date
        ? {
            bookings: {
              none: {
                status: { in: ["PAID", "ACCEPTED"] as const },
                eventDate: makeDayRange(filters.date),
              },
            },
          }
        : {}),
    },
    include: {
      services: {
        where: { isActive: true },
        select: { priceKobo: true, category: true },
      },
      reviewsReceived: {
        where: { isPublic: true },
        select: { rating: true },
      },
      portfolioItems: {
        take: 1,
        orderBy: { displayOrder: "asc" },
        select: { imageUrl: true, category: true },
      },
    },
  });

  // Derive display fields app-side
  type Sortable = VendorBrowseItem & { createdAt: Date };

  const processed: Sortable[] = rawVendors.map((v) => {
    const prices = v.services.map((s) => s.priceKobo);
    const startingPriceKobo = prices.length > 0 ? Math.min(...prices) : null;

    const reviewCount = v.reviewsReceived.length;
    const avgRating =
      reviewCount > 0
        ? v.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : null;

    return {
      id: v.id,
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
      avgRating,
      reviewCount,
      createdAt: v.createdAt,
    };
  });

  // Price-band filter (app-side)
  const filtered = applyPriceBand(processed, filters.price);

  // Sort
  const sorted = sortVendors(filtered, filters.sort);

  // Paginate
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  // Strip internal createdAt before returning
  const vendors: VendorBrowseItem[] = sorted
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    .map(({ createdAt: _date, ...item }) => item);

  return { vendors, total, page, totalPages };
}

function makeDayRange(dateStr: string): { gte: Date; lt: Date } {
  const [year, month, day] = dateStr.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(year!, month! - 1, day!)),
    lt: new Date(Date.UTC(year!, month! - 1, day! + 1)),
  };
}

function derivePrimaryCategory(
  services: Array<{ category: string }>,
  fallback: string | null | undefined,
): VendorCategory | null {
  if (services.length === 0) return (fallback as VendorCategory) ?? null;
  const counts: Record<string, number> = {};
  for (const s of services) {
    counts[s.category] = (counts[s.category] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
  return (top?.[0] as VendorCategory) ?? null;
}

type WithDate = VendorBrowseItem & { createdAt: Date };

function applyPriceBand(
  vendors: WithDate[],
  band: VendorSearchParams["price"],
): WithDate[] {
  if (band === "any") return vendors;
  return vendors.filter((v) => {
    if (v.startingPriceKobo === null) return false;
    switch (band) {
      case "under-50k":
        return v.startingPriceKobo < 5_000_000;
      case "50k-200k":
        return (
          v.startingPriceKobo >= 5_000_000 && v.startingPriceKobo < 20_000_000
        );
      case "over-200k":
        return v.startingPriceKobo >= 20_000_000;
    }
  });
}

function sortVendors(
  vendors: WithDate[],
  sort: VendorSearchParams["sort"],
): WithDate[] {
  const arr = [...vendors];
  switch (sort) {
    case "price_asc":
      return arr.sort((a, b) => {
        if (a.startingPriceKobo === null) return 1;
        if (b.startingPriceKobo === null) return -1;
        return a.startingPriceKobo - b.startingPriceKobo;
      });
    case "price_desc":
      return arr.sort((a, b) => {
        if (a.startingPriceKobo === null) return 1;
        if (b.startingPriceKobo === null) return -1;
        return b.startingPriceKobo - a.startingPriceKobo;
      });
    case "rating":
    case "recommended":
      return arr.sort((a, b) => {
        if (a.avgRating === null && b.avgRating === null)
          return b.createdAt.getTime() - a.createdAt.getTime();
        if (a.avgRating === null) return 1;
        if (b.avgRating === null) return -1;
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    case "newest":
      return arr.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
  }
}

// ── Vendor Detail ────────────────────────────────────────────────────────────

export async function getVendorBySlug(
  slug: string,
): Promise<VendorDetail | null> {
  const vendor = await db.vendorProfile.findFirst({
    where: {
      slug,
      verificationStatus: "APPROVED",
      user: { isSuspended: false },
    },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { priceKobo: "asc" },
        select: {
          id: true,
          category: true,
          title: true,
          description: true,
          priceKobo: true,
          durationHours: true,
          servesUpTo: true,
        },
      },
      portfolioItems: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, imageUrl: true, caption: true, category: true },
      },
      reviewsReceived: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          customer: { select: { fullName: true } },
        },
      },
    },
  });

  if (!vendor) return null;

  const reviewCount = vendor.reviewsReceived.length;
  const avgRating =
    reviewCount > 0
      ? vendor.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
        reviewCount
      : null;

  return {
    id: vendor.id,
    businessName: vendor.businessName,
    slug: vendor.slug,
    bio: vendor.bio,
    city: vendor.city,
    yearsOfExperience: vendor.yearsOfExperience,
    instagramHandle: vendor.instagramHandle ?? null,
    hasCac: Boolean(vendor.cacNumber),
    primaryCategory: derivePrimaryCategory(
      vendor.services,
      vendor.portfolioItems[0]?.category,
    ),
    coverImageUrl: vendor.portfolioItems[0]?.imageUrl ?? null,
    avgRating,
    reviewCount,
    services: vendor.services,
    portfolioItems: vendor.portfolioItems.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption ?? null,
    })),
    reviews: vendor.reviewsReceived.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title ?? null,
      body: r.body,
      reviewerName: r.customer.fullName,
      createdAt: r.createdAt,
    })),
  };
}
