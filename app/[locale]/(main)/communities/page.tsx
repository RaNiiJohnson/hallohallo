"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useConvexAuth } from "convex/react";
import { ArrowUpRight } from "lucide-react";
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
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <div className="flex items-center gap-2">
            <Link href="/communities/explore">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary text-primary"
              >
                <ArrowUpRight />
                <span>{t("exploreAction")}</span>
              </Button>
            </Link>
            {isAuthenticated && !isLoading && <CreateCommunityDialog />}
          </div>
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
