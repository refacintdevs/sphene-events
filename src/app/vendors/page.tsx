import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { VendorCard } from "@/components/vendor/VendorCard";
import { FilterSidebar } from "@/components/vendor/FilterSidebar";
import { MobileFilterSheet } from "@/components/vendor/MobileFilterSheet";
import { EmptyState } from "@/components/EmptyState";
import { searchVendors } from "@/services/vendor";
import {
  vendorSearchSchema,
  type VendorSearchParams,
} from "@/lib/validators/vendor-search";

export const metadata: Metadata = {
  title: "Browse Vendors — EventIQ",
  description:
    "Find and book verified caterers, decorators, and photographers for your next event in Lagos.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = vendorSearchSchema.parse(raw);

  const { vendors, total, page, totalPages } = await searchVendors(filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Browse Vendors
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {total} verified vendor{total !== 1 ? "s" : ""} in Lagos
          </p>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            All vendors verified
          </span>
        </div>
      </div>

      {/* Mobile filter trigger */}
      <div className="mb-4 md:hidden">
        <MobileFilterSheet>
          <FilterSidebar filters={filters} />
        </MobileFilterSheet>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <FilterSidebar filters={filters} />
        </aside>

        {/* Results column */}
        <section className="min-w-0 flex-1" aria-label="Vendor results">
          {vendors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vendors.map(({ id, ...cardProps }) => (
                  <VendorCard key={id} {...cardProps} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  filters={filters}
                  page={page}
                  totalPages={totalPages}
                />
              )}
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="h-12 w-12" aria-hidden="true" />}
              heading="No vendors found"
              description="Try adjusting your filters or clearing them to see all available vendors."
              action={{ label: "Clear all filters", href: "/vendors" }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────

function buildFilterUrl(
  filters: VendorSearchParams,
  newPage: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  filters.category.forEach((c) => params.append("category", c));
  if (filters.price !== "any") params.set("price", filters.price);
  if (filters.date) params.set("date", filters.date);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  params.set("page", String(newPage));
  const qs = params.toString();
  return qs ? `/vendors?${qs}` : "/vendors";
}

function Pagination({
  filters,
  page,
  totalPages,
}: {
  filters: VendorSearchParams;
  page: number;
  totalPages: number;
}) {
  return (
    <nav
      className="mt-10 flex items-center justify-between"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={buildFilterUrl(filters, page - 1)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center gap-1 text-sm text-muted-foreground">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildFilterUrl(filters, page + 1)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="flex cursor-not-allowed items-center gap-1 text-sm text-muted-foreground">
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
