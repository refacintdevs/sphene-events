import { Skeleton } from "@/components/ui/skeleton";

export default function VendorDetailLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border">
        <Skeleton className="aspect-video w-full" />
        <div className="space-y-3 p-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      </div>

      {/* About */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Services */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-6 w-28" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Skeleton className="col-span-2 aspect-video rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </main>
  );
}
