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

export function EditJobDialog({ jobOffer }: { jobOffer: JobOfferDetails }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          <span>Modifier les détails</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;offre d&apos;emploi</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de votre offre
          </DialogDescription>
        </DialogHeader>
        <EditJobOfferForm jobOffer={jobOffer} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
