"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function MobileActionsMenu({ children }: { children: ReactNode }) {
  const t = useTranslations("common");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="rounded-full text-muted-foreground sm:hidden"
          aria-label={t("moreActions")}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label={t("moreActions")}
        className="w-48 space-y-0.5 rounded-lg p-1.5 shadow-lg [&>button]:h-9 [&>button]:w-full [&>button]:justify-start [&>button]:rounded-md [&>button]:border-0 [&>button]:bg-transparent! [&>button]:px-2.5 [&>button]:font-normal [&>button]:text-foreground! [&>button]:shadow-none [&>button]:hover:bg-accent! [&>button[data-variant=destructive]]:text-destructive!"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
