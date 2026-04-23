import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
  const t = await getTranslations("pricing");

  const freeFeatures = t.raw("free.features") as string[];
  const proFeatures = t.raw("pro.features") as string[];

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            {t("title")}
          </h1>
          <p>{t("description")}</p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
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
                  <h2 className="font-medium">{t("pro.name")}</h2>
                  <span className="my-3 block text-2xl font-semibold">
                    {t("pro.price")}
                  </span>
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

      {/* FAQ */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">{t("faq.title")}</h3>
        <p className="text-muted-foreground mb-6">{t("faq.description")}</p>
        <Button asChild variant="outline">
          <Link href="/faq">{t("faq.cta")}</Link>
        </Button>
      </div>
    </section>
  );
}
