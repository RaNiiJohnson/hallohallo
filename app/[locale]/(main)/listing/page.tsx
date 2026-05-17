"use client";

import { HeroSection } from "@/components/hero-section";
import { Button, buttonVariants } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { RealEstatesFilters } from "./_component/listingFilters";
import { ListingList } from "./_component/List/listingList";
import { Link } from "@/i18n/navigation";
import { PublishListingDialog } from "./_component/dialogs/publishListingDialog";
import { Suspense } from "react";
import { ListingPageSkeleton } from "./_component/skeleton";
import { useTranslations } from "next-intl";

export default function ListingPageContent() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations("listing");
  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroSection
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        backgroundImage="/images/real-estate-bg.png"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative">
          <Suspense
            fallback={
              <div className="space-y-6">
                <ListingPageSkeleton />
              </div>
            }
          >
            <RealEstatesFilters isAuthenticated={isAuthenticated} />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{t("list.title")}</h2>
              </div>
              {isAuthenticated && (
                <PublishListingDialog
                  trigger={
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>{t("list.publish")}</span>
                    </Button>
                  }
                />
              )}
            </div>
            <ListingList isAuthenticated={isAuthenticated} />
          </Suspense>
        </div>
        <div className="text-center flex flex-col items-center mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">
            {t("cta.title")}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t("cta.desc")}
          </p>
          {isAuthenticated ? (
            <PublishListingDialog
              trigger={<Button size="lg">{t("cta.publish")}</Button>}
            />
          ) : (
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              {t("cta.registerToPublish")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
