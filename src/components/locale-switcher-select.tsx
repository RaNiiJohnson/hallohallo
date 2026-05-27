"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Locale } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

const localeFlagMap: Record<string, string> = {
  fr: "fr",
  en: "gb",
  de: "de",
};

export default function LocaleSwitcherSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const currentLocale = params.locale as string;

  function switchLocale(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale as Locale,
      });
    });
  }

  return (
    <div className="flex items-center p-0.5">
      {routing.locales.map((locale) => (
        <Button
          key={locale}
          onClick={() => switchLocale(locale)}
          disabled={isPending}
          variant={currentLocale === locale ? "outline" : "ghost"}
          size="sm"
          className="rounded-full w-8 h-8 p-0"
        >
          <span
            className={cn("fi", `fi-${localeFlagMap[locale]}`, "rounded-sm")}
          />
        </Button>
      ))}
    </div>
  );
}
