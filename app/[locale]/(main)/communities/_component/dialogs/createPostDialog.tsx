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
import { Id } from "@convex/_generated/dataModel";
import { CreatePostForm } from "../forms/createPostForm";
import { useTranslations } from "next-intl";

interface CreatePostDialogProps {
  communityId: Id<"communities">;
  trigger?: React.ReactNode;
}

export function CreatePostDialog({
  communityId,
  trigger,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("communities.dialogs.createPost");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t("trigger")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm
          communityId={communityId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
