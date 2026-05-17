"use client";

import { Activity, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ListingForm } from "../forms/listingForm";
import { useTranslations } from "next-intl";

interface PublishListingDialogProps {
  trigger?: React.ReactNode;
}

export function PublishListingDialog({ trigger }: PublishListingDialogProps) {
  const t = useTranslations("listing");
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t("list.publish")}</span>
          </Button>
        )}
      </DialogTrigger>
      <Activity mode={open ? "visible" : "hidden"}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dialogs.publish.title")}</DialogTitle>
            <DialogDescription>{t("dialogs.publish.desc")}</DialogDescription>
          </DialogHeader>
          <ListingForm onSuccess={handleSuccess} />
        </DialogContent>
      </Activity>
    </Dialog>
  );
}
