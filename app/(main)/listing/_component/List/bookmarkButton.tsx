"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  initialBookmark?: boolean;
  className?: string;
}

export const BookmarkButton = ({
  initialBookmark = false,
  className,
}: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmark);
  const [optimisticIsBookmarked, setOptimisticIsBookmarked] = useOptimistic(
    isBookmarked,
    (_, newState: boolean) => newState,
  );

  const [, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isBookmarked;

    startTransition(async () => {
      setOptimisticIsBookmarked(newState); // Mise à jour optimiste

      try {
        setIsBookmarked(newState); // Mise à jour de l'état réel
        toast.success(
          newState ? "Offre enregistrée" : "Offre retirée des favoris",
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // L'état optimiste reviendra automatiquement à isBookmarked
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
