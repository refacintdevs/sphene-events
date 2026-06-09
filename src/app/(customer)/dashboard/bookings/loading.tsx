import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerBookingsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Heading */}
      <Skeleton className="mb-2 h-8 w-36" />
      <Skeleton className="mb-8 h-4 w-72" />

      {/* Booking cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 space-y-4"
          >
            {/* Header: code + status */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-40 rounded-full" />
            </div>
            {/* Service + vendor */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            {/* Event details */}
            <div className="flex gap-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-44" />
            </div>
            {/* Amounts */}
            <div className="flex gap-6 border-t border-border pt-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
