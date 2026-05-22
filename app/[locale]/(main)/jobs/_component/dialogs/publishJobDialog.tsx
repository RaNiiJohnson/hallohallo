"use client";

import { Activity, useState } from "react";
import { useTranslations } from "next-intl";
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
import { JobOfferForm } from "../forms/jobOfferForm";

interface PublishJobDialogProps {
  trigger?: React.ReactNode;
}

export function PublishJobDialog({ trigger }: PublishJobDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("jobs");

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t("publish")}</span>
          </Button>
        )}
      </DialogTrigger>
      <Activity mode={open ? "visible" : "hidden"}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("dialogs.publish.title")}</DialogTitle>
            <DialogDescription>
              {t("dialogs.publish.desc")}
            </DialogDescription>
          </DialogHeader>
          <JobOfferForm onSuccess={handleSuccess} />
        </DialogContent>
      </Activity>
    </Dialog>
  );
}
