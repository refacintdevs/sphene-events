import { Skeleton } from "@/components/ui/skeleton";

export default function BookServiceLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Skeleton className="mb-6 h-5 w-40" />

      {/* Heading */}
      <Skeleton className="mb-2 h-8 w-52" />
      <Skeleton className="mb-8 h-4 w-80" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form skeleton */}
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Summary panel skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border p-5 space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="border-t border-border pt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
