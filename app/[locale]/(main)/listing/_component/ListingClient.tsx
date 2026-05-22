"use client";

import { useConvexAuth } from "convex/react";
import { RealEstatesFilters } from "./listingFilters";
import { ListingList } from "./List/listingList";
import { PublishListingDialog } from "./dialogs/publishListingDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

export function ListingClient() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations("listing");

  return (
    <>
      <RealEstatesFilters isAuthenticated={isAuthenticated} />

      {isAuthenticated && (
        <div className="flex justify-end my-4">
          <PublishListingDialog
            trigger={
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>{t("list.publish")}</span>
              </Button>
            }
          />
        </div>
      )}

      <ListingList isAuthenticated={isAuthenticated} />
    </>
  );
}
