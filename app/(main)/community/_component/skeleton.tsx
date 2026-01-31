import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export function UserCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col p-0">
      {/* Cover Image - avec image par défaut */}
      <div className="relative h-24 bg-linear-to-br from-primary/20 to-primary/5">
        <Image
          src="/default-cover.jpg"
          alt="Couverture"
          fill
          className="object-cover dark:hidden opacity-50"
        />
        <Image
          src="/default-cover-s.png"
          alt="Couverture"
          fill
          className="object-cover hidden dark:block opacity-50"
        />
      </div>

      <CardContent className="p-0 flex flex-col flex-1">
        {/* Avatar - avec image par défaut */}
        <div className="relative px-4 sm:px-6">
          <div className="relative -mt-12 h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-muted shadow-xl">
            <Image
              src="/random-user.png"
              alt="Avatar"
              fill
              className="object-cover opacity-50"
            />
          </div>
        </div>

        {/* User Info Skeleton */}
        <div className="px-4 sm:px-6 pb-6 pt-3 space-y-3 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            {/* Nom */}
            <Skeleton className="h-6 w-3/4" />

            {/* Headline - 2 lignes */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          {/* Country */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>

          {/* Bouton */}
          <Skeleton className="h-9 w-full rounded-md mt-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour afficher plusieurs skeletons
export function UserCardsLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-80 mb-2" />
        <Skeleton className="h-5 w-60" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
