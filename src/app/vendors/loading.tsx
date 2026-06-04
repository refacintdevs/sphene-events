import { Skeleton } from "@/components/ui/skeleton";

export default function VendorsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Mobile filter trigger placeholder */}
      <div className="mb-4 md:hidden">
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 space-y-5 md:block">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-9 w-full" />
        </aside>

        {/* Card grid skeleton — shape-matched to VendorCard */}
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border"
            >
              <Skeleton className="aspect-4/5 w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
