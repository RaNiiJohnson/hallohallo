"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface BookmarkButtonProps {
  listingId: string;
  initialBookmark?: boolean;
  className?: string;
}

export const BookmarkButton = ({
  listingId,
  initialBookmark = false,
  className,
}: BookmarkButtonProps) => {
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
          resourceId: listingId as Id<"RealestateListing">,
          resourceType: "realEstate",
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
      size="icon-sm"
      className={cn(
        "absolute top-2 right-2 rounded-md z-10 bg-white/70 backdrop-blur-sm text-red-500 transition-all group-hover:scale-110 hover:bg-white/90 hover:text-red-600",
        className,
      )}
      onClick={handleToggle}
    >
      {optimisticIsBookmarked ? (
        <Heart className="size-4 fill-current" />
      ) : (
        <Heart className="size-4" />
      )}
      <span className="sr-only">
        {optimisticIsBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
};
