"use client";

import { HeroSection } from "@/components/hero-section";
import { Button, buttonVariants } from "@/components/ui/button";
import { JobFilters } from "./_component/jobFilters";
import { PublishJobDialog } from "./_component/dialogs/publishJobDialog";
import { JobList } from "./_component/jobList";
import { Link } from "@/i18n/navigation";
import { useConvexAuth } from "convex/react";
import { Suspense } from "react";
import { JobFiltersSkeleton, JobPageSkeleton } from "./_component/skeleton";
import { useTranslations } from "next-intl";

export default function JobsPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("jobs");

  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroSection
        title={t("hero.title")}
        subtitle={t("hero.description")}
        backgroundImage="/images/jobs-bg.png"
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative">
          <Suspense
            fallback={
              <div className="space-y-6">
                <JobFiltersSkeleton />
                <JobPageSkeleton />
              </div>
            }
          >
            <JobFilters isAuthenticated={isAuthenticated} />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{t("title")}</h2>
              </div>
              {isAuthenticated && !isLoading && <PublishJobDialog />}
            </div>
            <JobList />
          </Suspense>
        </div>
        {/* Call to action */}
        <div className="text-center flex flex-col items-center  mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">{t("cta.title")}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          {isAuthenticated ? (
            <PublishJobDialog
              trigger={<Button size="lg">{t("publish")}</Button>}
            />
          ) : (
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
