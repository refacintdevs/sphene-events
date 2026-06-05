import { db } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PendingVendorItem {
  id: string;
  businessName: string;
  slug: string;
  city: string;
  primaryCategory: string | null;
  createdAt: Date;
}

export interface VendorSubmission {
  id: string;
  businessName: string;
  slug: string;
  bio: string;
  cacNumber: string | null;
  whatsappNumber: string;
  instagramHandle: string | null;
  city: string;
  address: string;
  yearsOfExperience: number;
  primaryCategory: string | null;
  verificationStatus: string;
  verificationNotes: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  createdAt: Date;
  ownerEmail: string;
  ownerName: string;
  portfolioItems: Array<{ id: string; imageUrl: string; caption: string | null }>;
  documents: Array<{ id: string; type: string; fileUrl: string; fileName: string; uploadedAt: Date }>;
  services: Array<{ id: string; category: string; title: string; priceKobo: number; isActive: boolean }>;
}

// ── Read functions ────────────────────────────────────────────────────────────

export async function getPendingVendors(): Promise<PendingVendorItem[]> {
  const vendors = await db.vendorProfile.findMany({
    where: { verificationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      businessName: true,
      slug: true,
      city: true,
      primaryCategory: true,
      createdAt: true,
      services: {
        where: { isActive: true },
        select: { category: true },
        take: 1,
      },
    },
  });

  return vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    slug: v.slug,
    city: v.city,
    // DB field takes priority; fall back to first active service category only if null.
    primaryCategory: v.primaryCategory ?? v.services[0]?.category ?? null,
    createdAt: v.createdAt,
  }));
}

export async function getAdminOverviewStats(): Promise<{
  pendingCount: number;
  totalVendors: number;
  approvedCount: number;
}> {
  const [pendingCount, totalVendors, approvedCount] = await Promise.all([
    db.vendorProfile.count({ where: { verificationStatus: "PENDING" } }),
    db.vendorProfile.count(),
    db.vendorProfile.count({ where: { verificationStatus: "APPROVED" } }),
  ]);
  return { pendingCount, totalVendors, approvedCount };
}

export async function getVendorSubmission(
  id: string,
): Promise<VendorSubmission | null> {
  const vendor = await db.vendorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, fullName: true } },
      portfolioItems: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, imageUrl: true, caption: true },
      },
      documents: {
        orderBy: { uploadedAt: "asc" },
        select: { id: true, type: true, fileUrl: true, fileName: true, uploadedAt: true },
      },
      services: {
        select: { id: true, category: true, title: true, priceKobo: true, isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!vendor) return null;

  return {
    id: vendor.id,
    businessName: vendor.businessName,
    slug: vendor.slug,
    bio: vendor.bio,
    cacNumber: vendor.cacNumber,
    whatsappNumber: vendor.whatsappNumber,
    instagramHandle: vendor.instagramHandle,
    city: vendor.city,
    address: vendor.address,
    yearsOfExperience: vendor.yearsOfExperience,
    // DB field takes priority; fall back to first service category only if null.
    primaryCategory: vendor.primaryCategory ?? vendor.services[0]?.category ?? null,
    verificationStatus: vendor.verificationStatus,
    verificationNotes: vendor.verificationNotes,
    bankName: vendor.bankName,
    bankAccountNumber: vendor.bankAccountNumber,
    bankAccountName: vendor.bankAccountName,
    createdAt: vendor.createdAt,
    ownerEmail: vendor.user.email,
    ownerName: vendor.user.fullName,
    portfolioItems: vendor.portfolioItems,
    documents: vendor.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      uploadedAt: d.uploadedAt,
    })),
    services: vendor.services.map((s) => ({
      id: s.id,
      category: s.category,
      title: s.title,
      priceKobo: s.priceKobo,
      isActive: s.isActive,
    })),
  };
}
