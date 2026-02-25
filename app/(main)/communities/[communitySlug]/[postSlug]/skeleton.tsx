import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPost() {
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 pt-2 sm:pt-8 mb-2 sm:mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="max-w-3xl mx-auto py-2 space-y-4">
        {/* Article */}
        <div className="border-b border-border bg-background px-4 py-4 space-y-3">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-10 rounded-md" />
            <Skeleton className="h-8 w-10 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
