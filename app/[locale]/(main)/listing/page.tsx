import { HeroSection } from "@/components/hero-section";
import { ListingClient } from "./_component/ListingClient";
import { ListingPageSkeleton } from "./_component/skeleton";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { CTAButton } from "./_component/CTAButton";

export default async function ListingPage() {
  const t = await getTranslations("listing");

  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroSection
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        backgroundImage="/images/real-estate-bg.png"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative">
          <div className="flex items-center gap-2 my-8">
            <h2 className="text-2xl font-bold">{t("list.title")}</h2>
          </div>

          <Suspense fallback={<ListingPageSkeleton />}>
            <ListingClient />
          </Suspense>
        </div>

        <div className="text-center flex flex-col items-center mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">{t("cta.title")}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t("cta.desc")}
          </p>
          {/* Le bouton CTA dépend de isAuthenticated → reste dans ListingClient */}
          <Suspense
            fallback={
              <div className="h-11 w-40 bg-muted rounded-md animate-pulse" />
            }
          >
            <CTAButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
