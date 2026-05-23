"use client";

import { useParams } from "next/navigation";
import { Locale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { routing } from "@/i18n/routing";

export default function LocaleSwitcherSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [isPending, startTransition] = useTransition();

  const t = useTranslations("localeSwitcher");

  const currentLocale = params.locale as string;

  function onValueChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, {
        locale: nextLocale as Locale,
      });
    });
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={onValueChange}
      disabled={isPending}
    >
      <SelectTrigger size="sm" className="bg-transparent border-none w-[120px]">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {routing.locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {t(locale) || locale}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
