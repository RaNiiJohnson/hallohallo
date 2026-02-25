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

interface CreatePostDialogProps {
  communityId: Id<"communities">;
  trigger?: React.ReactNode;
}

export function CreatePostDialog({
  communityId,
  trigger,
}: CreatePostDialogProps) {
  const [open, setOpen] = useState(false);

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
            <span>Créer un post</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un post</DialogTitle>
          <DialogDescription>
            Partagez quelque chose avec la communauté
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
