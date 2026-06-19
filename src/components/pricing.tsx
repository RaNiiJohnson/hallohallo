"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PricingPage() {
  const t = useTranslations("pricing");

  const freeFeatures = t.raw("free.features") as string[];
  const proFeatures = t.raw("pro.features") as string[];

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h1 className="text-center text-3xl font-semibold">{t("title")}</h1>
          <p className="text-accent-foreground">{t("description")}</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-5 md:gap-0">
          {/* Free */}
          <div className="rounded-lg flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">{t("free.name")}</h2>
                <span className="my-3 block text-2xl font-semibold">
                  {t("free.price")}
                </span>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="">{t("free.cta")}</Link>
              </Button>

              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {freeFeatures.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro */}
          <div className="dark:bg-muted rounded-lg border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{t("pro.name")}</h2>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t("pro.earlyBirdBadge")}
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">
                      {t("pro.earlyBirdPrice")}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                      {t("pro.price")}
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href="">{t("pro.cta")}</Link>
                </Button>
              </div>

              <div>
                <ul className="mt-4 list-outside space-y-3 text-sm">
                  {proFeatures.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
