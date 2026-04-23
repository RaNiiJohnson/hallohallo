"use client";

import { Suspense } from "react";
import ComFilters from "./_component/comFilters";
import { CreateCommunityDialog } from "./_component/dialogs/createComDialog";
import { useConvexAuth } from "convex/react";

import ComList from "./_component/List/comList";
import { useTranslations } from "next-intl";

export default function Page() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("communities");

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto lg:px-4 sm:px-2 py-8">
        <div className="relative">
          <Suspense
            fallback={
              <div className="space-y-6">
                {/* <JobFiltersSkeleton /> */}
                {/* <ComFilters /> */}
                loading
              </div>
            }
          >
            <ComFilters />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{t("title")}</h2>
              </div>
              {isAuthenticated && !isLoading && <CreateCommunityDialog />}
            </div>
            <ComList />
          </Suspense>
        </div>
        {/* Call to action */}
        {/* <div className="text-center flex flex-col items-center  mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">communauté hallohallo</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto"></p>
          {isAuthenticated ? (
            <PublishJobDialog
              trigger={<Button size="lg">Publier une offre</Button>}
            />
          ) : (
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              S&apos;inscrire pour publier
            </Link>
          )}
        </div>*/}
      </div>
    </div>
  );
}

// export default function ShuffledPostsFeed() {

//   return (

//   );
// }
