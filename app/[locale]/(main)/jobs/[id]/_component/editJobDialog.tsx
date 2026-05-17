"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditJobOfferForm } from "./editJobOfferForm";
import { JobOfferDetails } from "@/lib/convexTypes";
import { useTranslations } from "next-intl";

export function EditJobDialog({ jobOffer }: { jobOffer: JobOfferDetails }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("jobs.dialogs.edit");

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          <span>{t("trigger")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <EditJobOfferForm jobOffer={jobOffer} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
