import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import {
  HomePageContent,
  HomePageSkeleton,
} from "@/components/home-page-content";
import { Locale } from "@/i18n/routing";
import PricingPage from "@/components/pricing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent>
        <PricingPage />
      </HomePageContent>
    </Suspense>
  );
}
