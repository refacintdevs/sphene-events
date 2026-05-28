import { VendorCard, type VendorCardData } from "@/components/vendor/VendorCard";

interface FeaturedVendorsSectionProps {
  vendors: VendorCardData[];
}

export function FeaturedVendorsSection({ vendors }: FeaturedVendorsSectionProps) {
  if (vendors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
      {/* Section header */}
      <div className="mb-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted and verified
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Featured vendors
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Every vendor on Sphene Events is reviewed and approved by our team
          before appearing in search results.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.slug} {...vendor} />
        ))}
      </div>
    </section>
  );
}
