"use client";

import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface PostBookmarkButtonProps {
  postId: Id<"posts">;
  initialBookmark?: boolean;
  className?: string;
}

export const PostBookmarkButton = ({
  postId,
  initialBookmark = false,
  className,
}: PostBookmarkButtonProps) => {
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
          resourceId: postId,
          resourceType: "post",
        });
        toast.success(
          newState ? "Post enregistré" : "Post retiré des favoris",
        );
      } catch {
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "group flex items-center gap-1.5 transition-colors h-8 px-2 ml-auto",
        optimisticIsBookmarked
          ? "text-blue-500 hover:bg-blue-500/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className,
      )}
      onClick={handleToggle}
    >
      <Bookmark
        size={15}
        className={cn(
          "transition-transform group-active:scale-95",
          optimisticIsBookmarked && "fill-current",
        )}
      />
      <span className="sr-only">
        {optimisticIsBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
      </span>
    </Button>
  );
};
