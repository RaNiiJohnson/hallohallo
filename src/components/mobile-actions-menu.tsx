"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function MobileActionsMenu({ children }: { children: ReactNode }) {
  const t = useTranslations("common");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="sm:hidden"
          aria-label={t("moreActions")}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-52 space-y-1 p-1 [&>button]:w-full [&>button]:justify-start [&>button]:border-0 [&>button]:shadow-none"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
