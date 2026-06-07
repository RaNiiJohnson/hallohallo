"use client";

import { useConvexAuth } from "convex/react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import ComFilters from "./_component/comFilters";
import { CreateCommunityDialog } from "./_component/dialogs/createComDialog";
import ComList from "./_component/List/comList";

export default function Page() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("communities");

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold">{t("title")}</h1>
          {isAuthenticated && !isLoading && <CreateCommunityDialog />}
        </div>
        <Suspense fallback={null}>
          <ComFilters />
        </Suspense>
      </div>

      {/* Feed */}
      <Suspense fallback={null}>
        <ComList />
      </Suspense>
    </div>
  );
}
