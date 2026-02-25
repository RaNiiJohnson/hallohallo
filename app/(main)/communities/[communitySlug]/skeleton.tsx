import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCommunity() {
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 pt-2 sm:pt-8 mb-2 sm:mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-32" />
      </div>
      {/* Community header */}
      <div className="bg-card border-b border-border flex max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </div>
      {/* Post list */}
      <div className="max-w-4xl mx-auto py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-border space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
