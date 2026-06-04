import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ExternalLink,
  Clock,
  Users,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/vendor/VerifiedBadge";
import { PortfolioGallery } from "@/components/vendor/PortfolioGallery";
import { getVendorBySlug } from "@/services/vendor";
import { formatNaira } from "@/lib/format";
import type { ReviewItem, ServiceItem } from "@/services/vendor";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return { title: "Vendor Not Found — EventIQ" };
  return {
    title: `${vendor.businessName} — EventIQ`,
    description: vendor.bio.slice(0, 155),
  };
}

export default async function VendorDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);

  if (!vendor) notFound();

  const heroImage = vendor.coverImageUrl ?? "https://placehold.co/1200x630";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border">
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={heroImage}
            alt={`${vendor.businessName} cover photo`}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {vendor.businessName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {vendor.city}
                </span>
                {vendor.primaryCategory && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">
                      {vendor.primaryCategory.charAt(0) +
                        vendor.primaryCategory.slice(1).toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>

            <VerifiedBadge hasCac={vendor.hasCac} />
          </div>

          {/* Rating row */}
          <div className="mt-4 flex items-center gap-2">
            {vendor.avgRating !== null ? (
              <div className="flex items-center gap-1.5">
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(vendor.avgRating!)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {vendor.avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({vendor.reviewCount}{" "}
                  {vendor.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : (
              <span className="rounded-md bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                New vendor
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section className="mb-8" aria-labelledby="about-heading">
        <h2
          id="about-heading"
          className="mb-3 font-display text-xl font-semibold text-foreground"
        >
          About
        </h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {vendor.bio}
        </p>

        <dl className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Experience
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {vendor.yearsOfExperience}{" "}
              {vendor.yearsOfExperience === 1 ? "year" : "years"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              City
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {vendor.city}
            </dd>
          </div>
        </dl>

        {vendor.instagramHandle && (
          <a
            href={`https://instagram.com/${vendor.instagramHandle.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />@
            {vendor.instagramHandle.replace(/^@/, "")}
          </a>
        )}
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="mb-8" aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="mb-4 font-display text-xl font-semibold text-foreground"
        >
          Services
        </h2>

        {vendor.services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No services listed yet.
          </p>
        ) : (
          <div className="space-y-4">
            {vendor.services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* ── Portfolio ─────────────────────────────────────────────────────── */}
      {vendor.portfolioItems.length > 0 && (
        <section className="mb-8" aria-labelledby="portfolio-heading">
          <h2
            id="portfolio-heading"
            className="mb-4 font-display text-xl font-semibold text-foreground"
          >
            Portfolio
          </h2>
          <PortfolioGallery items={vendor.portfolioItems} />
        </section>
      )}

      {/* ── Reviews ───────────────────────────────────────────────────────── */}
      <section aria-labelledby="reviews-heading">
        <h2
          id="reviews-heading"
          className="mb-4 font-display text-xl font-semibold text-foreground"
        >
          Reviews
          {vendor.reviewCount > 0 && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({vendor.reviewCount})
            </span>
          )}
        </h2>

        {vendor.reviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-8 text-center">
            <MessageSquare
              className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground">
              No reviews yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to book and leave a review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendor.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground">{service.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {service.description}
          </p>

          {(service.durationHours !== null ||
            service.servesUpTo !== null) && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {service.durationHours !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {service.durationHours}h
                </span>
              )}
              {service.servesUpTo !== null && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  Serves up to {service.servesUpTo}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-semibold text-foreground">
            {formatNaira(service.priceKobo)}
          </span>
          {/* Booking CTA — stub for Unit 1.3; wired in the booking flow unit */}
          <Button asChild size="sm">
            <Link href={`/book/${service.id}`}>Book this service</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const dateStr = review.createdAt.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {review.reviewerName}
          </p>
          <time
            dateTime={review.createdAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {dateStr}
          </time>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {review.title && (
        <p className="mt-3 text-sm font-medium text-foreground">
          {review.title}
        </p>
      )}
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {review.body}
      </p>
    </div>
  );
}
