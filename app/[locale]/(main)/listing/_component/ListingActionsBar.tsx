"use client";

import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PublishListingDialog } from "./dialogs/publishListingDialog";

export function ListingActionsBar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("listing");

  if (!isAuthenticated || isLoading) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-4">
      <div className="flex-1" />
      <PublishListingDialog
        trigger={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t("list.publish")}</span>
          </Button>
        }
      />
    </div>
  );
}
