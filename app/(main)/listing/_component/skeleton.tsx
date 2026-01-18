import { Skeleton } from "@/components/ui/skeleton";

export function ImmobilierFiltersSkeleton() {
  return (
<div>
      <div className="space-y-4 max-w-3xl mx-auto">
      {/* Barre de recherche skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Filtres rapides skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
   
    </div>
       <div className="col-span-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
</div>
  );
}

export function ImmobilierListSkeleton() {
  return (
    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative">
          <div className="h-80 w-full rounded-xl bg-muted"></div>
          <div className="absolute inset-x-3 bottom-3 p-3 bg-background/95 backdrop-blur-sm rounded-lg border">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ImmobilierPageSkeleton() {
  return (
    <>
      <ImmobilierFiltersSkeleton />
      <ImmobilierListSkeleton />
    </>
  );
}

export function PropertyPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse ">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="h-10 bg-muted rounded w-48"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="h-96 bg-muted rounded-xl"></div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
