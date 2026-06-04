import { z } from "zod";

export const VENDOR_CATEGORIES = [
  "CATERING",
  "DECORATION",
  "PHOTOGRAPHY",
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

const PRICE_BANDS = [
  "any",
  "under-50k",
  "50k-200k",
  "over-200k",
] as const;

const SORT_OPTIONS = [
  "recommended",
  "price_asc",
  "price_desc",
  "rating",
  "newest",
] as const;

export type PriceBand = (typeof PRICE_BANDS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

// Deliberate deviation from architecture.md invariant 5 (reject-with-400):
// that invariant applies to mutating route handlers. This is a public read
// page that must degrade gracefully on malformed URLs — per-field .catch()
// defaults instead of returning 400.
export const vendorSearchSchema = z.object({
  q: z.preprocess(
    (v) => (typeof v === "string" ? v : ""),
    z.string(),
  ).catch(""),

  // Handles both checkbox multi-value (?category=X&category=Y → string[])
  // and comma-separated (?category=X,Y → string). Both produce the same result.
  category: z.preprocess(
    (v) => {
      if (Array.isArray(v)) return v.join(",");
      if (typeof v === "string") return v;
      return "";
    },
    z.string().transform((val): VendorCategory[] => {
      if (!val) return [];
      return val
        .split(",")
        .map((c) => c.trim())
        .filter((c): c is VendorCategory =>
          (VENDOR_CATEGORIES as readonly string[]).includes(c),
        );
    }),
  ).catch([]),

  city: z.preprocess(
    (v) => (typeof v === "string" ? v : "LAGOS"),
    z.string(),
  ).catch("LAGOS"),

  price: z.preprocess(
    (v) => (typeof v === "string" ? v : "any"),
    z.enum(PRICE_BANDS),
  ).catch("any"),

  // Only accept ISO date strings (YYYY-MM-DD); anything else becomes undefined.
  date: z.preprocess(
    (v) =>
      typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined,
    z.string().optional(),
  ).catch(undefined),

  sort: z.preprocess(
    (v) => (typeof v === "string" ? v : "recommended"),
    z.enum(SORT_OPTIONS),
  ).catch("recommended"),

  page: z.preprocess((v) => {
    const n = parseInt(typeof v === "string" ? v : "1", 10);
    return isNaN(n) || n < 1 ? 1 : n;
  }, z.number().int().min(1)).catch(1),
});

export type VendorSearchParams = z.infer<typeof vendorSearchSchema>;
