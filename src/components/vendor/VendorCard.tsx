import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed, Sparkles, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNaira, truncate, getInitials } from "@/lib/format";

export interface VendorCardData {
  businessName: string;
  slug: string;
  city: string;
  bio: string;
  yearsOfExperience: number;
  startingPriceKobo: number | null;
  primaryCategory: "CATERING" | "DECORATION" | "PHOTOGRAPHY" | null;
  coverImageUrl: string | null;
}

const CATEGORY_ICONS = {
  CATERING: UtensilsCrossed,
  DECORATION: Sparkles,
  PHOTOGRAPHY: Camera,
} as const;

const CATEGORY_LABELS = {
  CATERING: "Catering",
  DECORATION: "Decoration",
  PHOTOGRAPHY: "Photography",
} as const;

export function VendorCard({
  businessName,
  slug,
  city,
  bio,
  yearsOfExperience,
  startingPriceKobo,
  primaryCategory,
  coverImageUrl,
}: VendorCardData) {
  const isCloudinaryUrl =
    coverImageUrl?.startsWith("https://res.cloudinary.com/") ?? false;

  const CategoryIcon =
    primaryCategory != null ? CATEGORY_ICONS[primaryCategory] : Sparkles;

  const initials = getInitials(businessName);

  return (
    <Link
      href={`/vendors/${slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Image / placeholder */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {isCloudinaryUrl ? (
          /* TODO Phase 1: add res.cloudinary.com to next.config.ts images.remotePatterns before real uploads land */
          <Image
            src={coverImageUrl!}
            alt={`${businessName} portfolio`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <CategoryIcon
              className="h-16 w-16 text-foreground opacity-20"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Initials pill — always shown */}
        <div className="absolute left-3 top-3 rounded-full bg-card/80 px-2.5 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
          {initials}
        </div>

        {/* Category badge */}
        {primaryCategory != null && (
          <div className="absolute bottom-3 right-3 rounded-full bg-card/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {CATEGORY_LABELS[primaryCategory]}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-card-foreground leading-snug">
          {businessName}
        </h3>

        <div className="mt-1 flex items-center justify-between">
          {startingPriceKobo != null ? (
            <p className="text-sm font-semibold text-primary">
              From {formatNaira(startingPriceKobo)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Price on request</p>
          )}
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {city}
          {yearsOfExperience > 0 && ` · ${yearsOfExperience} yrs experience`}
        </p>

        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {truncate(bio, 110)}
        </p>
      </div>
    </Link>
  );
}
