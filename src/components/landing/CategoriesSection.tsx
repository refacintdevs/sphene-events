import Link from "next/link";
import { UtensilsCrossed, Sparkles, Camera, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoriesSectionProps {
  cateringCount: number;
  decorationCount: number;
  photographyCount: number;
}

const CATEGORIES = [
  {
    key: "CATERING" as const,
    label: "Catering",
    description:
      "From owambe spreads to corporate lunches — find caterers for every scale and style.",
    icon: UtensilsCrossed,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    hoverBorder: "hover:border-primary/30",
    ctaColor: "text-primary",
  },
  {
    key: "DECORATION" as const,
    label: "Decoration",
    description:
      "Transform any space into the setting your event deserves, from intimate to grand.",
    icon: Sparkles,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    hoverBorder: "hover:border-secondary/30",
    ctaColor: "text-secondary",
  },
  {
    key: "PHOTOGRAPHY" as const,
    label: "Photography",
    description:
      "Capture every moment with photographers who understand Nigerian celebrations.",
    icon: Camera,
    iconBg: "bg-verified/10",
    iconColor: "text-verified",
    hoverBorder: "hover:border-verified/30",
    ctaColor: "text-verified",
  },
] as const;

export function CategoriesSection({
  cateringCount,
  decorationCount,
  photographyCount,
}: CategoriesSectionProps) {
  const counts: Record<string, number> = {
    CATERING: cateringCount,
    DECORATION: decorationCount,
    PHOTOGRAPHY: photographyCount,
  };

  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            What we offer
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Three categories. Verified vendors.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = counts[cat.key] ?? 0;

            return (
              <Link
                key={cat.key}
                href={`/vendors?category=${cat.key}`}
                className={cn(
                  "group flex flex-col rounded-2xl border border-border bg-card p-6 md:p-8",
                  "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                  cat.hoverBorder,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl",
                    cat.iconBg,
                    cat.iconColor,
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>

                {/* Text */}
                <h3 className="mt-4 font-display text-2xl font-semibold text-card-foreground">
                  {cat.label}
                </h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {count} verified {count === 1 ? "vendor" : "vendors"}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>

                {/* CTA row */}
                <div
                  className={cn(
                    "mt-6 flex items-center gap-1 text-sm font-semibold",
                    cat.ctaColor,
                  )}
                >
                  Browse {cat.label.toLowerCase()}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
