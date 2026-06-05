import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-0">
      {/* StepIndicator skeleton — 4 circles + connectors */}
      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center last:flex-none">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="mt-2 hidden h-3 w-14 sm:block" />
          </div>
        ))}
      </div>

      {/* Step content skeleton */}
      <div className="mt-8 space-y-6">
        {/* Step heading */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Field rows */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
