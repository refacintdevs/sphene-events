import { Skeleton } from "@/components/ui/skeleton";

export default function VendorBookingsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Heading */}
      <Skeleton className="mb-2 h-8 w-52" />
      <Skeleton className="mb-8 h-4 w-80" />

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
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            {/* Service + customer */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-56" />
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
            {/* Action buttons */}
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
