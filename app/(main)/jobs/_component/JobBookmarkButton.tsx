"use client";

import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface JobBookmarkButtonProps {
  jobId: string;
  initialBookmark?: boolean;
  className?: string;
}

export const JobBookmarkButton = ({
  jobId,
  initialBookmark = false,
  className,
}: JobBookmarkButtonProps) => {
  const [optimisticIsBookmarked, setOptimisticIsBookmarked] = useOptimistic(
    initialBookmark,
    (_, newState: boolean) => newState,
  );

  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const [, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !optimisticIsBookmarked;

    startTransition(async () => {
      setOptimisticIsBookmarked(newState);

      try {
        await toggleBookmark({
          resourceId: jobId as Id<"JobOffer">,
          resourceType: "job",
        });
        toast.success(
          newState ? "Offre enregistrée" : "Offre retirée des favoris",
        );
      } catch {
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 mt-2",
        optimisticIsBookmarked
          ? "text-blue-500 hover:bg-blue-500/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      onClick={handleToggle}
    >
      <Bookmark
        className={cn("w-4 h-4", optimisticIsBookmarked && "fill-current")}
      />
      <span className="sr-only">
        {optimisticIsBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
};
