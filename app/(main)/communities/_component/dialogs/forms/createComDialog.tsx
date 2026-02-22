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
import { Plus } from "lucide-react";
import { CreateCommunityForm } from "../../createCommunityForm";

interface CreateCommunityDialogProps {
  trigger?: React.ReactNode;
}

export function CreateCommunityDialog({ trigger }: CreateCommunityDialogProps) {
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
            <span>Créer une communauté</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une communauté</DialogTitle>
          <DialogDescription>
            Créez un espace d&apos;échange autour d&apos;un thème commun
          </DialogDescription>
        </DialogHeader>
        <CreateCommunityForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
