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
import { JobOfferForm } from "../forms/jobOfferForm";

interface PublishJobDialogProps {
  trigger?: React.ReactNode;
}

export function PublishJobDialog({ trigger }: PublishJobDialogProps) {
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
            <span>Publier une offre</span>
          </Button>
        )}
      </DialogTrigger>
      <Activity mode={open ? "visible" : "hidden"}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publier une offre d&apos;emploi</DialogTitle>
            <DialogDescription>
              Partagez une opportunité d&apos;emploi avec la communauté
            </DialogDescription>
          </DialogHeader>
          <JobOfferForm onSuccess={handleSuccess} />
        </DialogContent>
      </Activity>
    </Dialog>
  );
}
