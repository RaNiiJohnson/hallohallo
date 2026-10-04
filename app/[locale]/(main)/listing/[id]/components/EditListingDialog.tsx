"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { ListingListDetails } from "@/lib/convexTypes";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ListingForm } from "../../_component/forms/listingForm";

interface EditListingDialogProps {
  listing: ListingListDetails;
}

export function EditListingDialog({ listing }: EditListingDialogProps) {
  const t = useTranslations("listing.dialogs.edit");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Pencil className="size-4" />
          <span className="max-sm:hidden">{t("trigger")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <ListingForm listing={listing} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
