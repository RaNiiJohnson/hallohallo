import { Skeleton } from "@/components/ui/skeleton";

export function ComListSkeleton() {
  return (
    <div className="flex flex-col gap-4 items-center">
      {Array.from({ length: 1 }).map((_, i) => (
        <div
          key={i}
          className="w-full max-w-4xl bg-card dark:bg-card/35 border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          <div className="divide-y ml-11 divide-border">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="px-4 py-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
