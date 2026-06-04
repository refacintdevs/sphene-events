import { cn } from "@/lib/utils";
import type { VendorSearchParams } from "@/lib/validators/vendor-search";

interface FilterSidebarProps {
  filters: VendorSearchParams;
  className?: string;
}

export function FilterSidebar({ filters, className }: FilterSidebarProps) {
  return (
    <form method="GET" action="/vendors" className={cn("space-y-6", className)}>
      {/* Free-text search */}
      <div>
        <label
          htmlFor="fs-q"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Search
        </label>
        <input
          id="fs-q"
          name="q"
          type="text"
          defaultValue={filters.q}
          placeholder="Business name or bio…"
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category — checkboxes; multiple values produce ?category=X&category=Y */}
      <fieldset>
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Category
        </legend>
        <div className="mt-2 space-y-2">
          {(
            [
              { value: "CATERING", label: "Catering" },
              { value: "DECORATION", label: "Decoration" },
              { value: "PHOTOGRAPHY", label: "Photography" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                name="category"
                value={value}
                defaultChecked={filters.category.includes(value)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* City — disabled; Lagos only in MVP */}
      <div>
        <label
          htmlFor="fs-city"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          City
        </label>
        <select
          id="fs-city"
          name="city"
          defaultValue="LAGOS"
          disabled
          className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
        >
          <option value="LAGOS">Lagos</option>
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          More cities coming in Phase 2
        </p>
      </div>

      {/* Price band — radio */}
      <fieldset>
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Price range
        </legend>
        <div className="mt-2 space-y-2">
          {(
            [
              { value: "any", label: "Any price" },
              { value: "under-50k", label: "Under ₦50,000" },
              { value: "50k-200k", label: "₦50,000 – ₦200,000" },
              { value: "over-200k", label: "Over ₦200,000" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="price"
                value={value}
                defaultChecked={filters.price === value}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Date availability */}
      <div>
        <label
          htmlFor="fs-date"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Available on date
        </label>
        <input
          id="fs-date"
          name="date"
          type="date"
          defaultValue={filters.date ?? ""}
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Approximate — excludes vendors with a confirmed booking on this date
        </p>
      </div>

      {/* Sort */}
      <div>
        <label
          htmlFor="fs-sort"
          className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
        >
          Sort by
        </label>
        <select
          id="fs-sort"
          name="sort"
          defaultValue={filters.sort}
          className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Apply filters
      </button>
    </form>
  );
}
