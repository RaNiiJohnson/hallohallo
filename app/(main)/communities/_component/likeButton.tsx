"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LikeButton({
  count,
  onLike,
  isLiked,
}: {
  count: number;
  onLike: () => void;
  isLiked?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`group flex items-center gap-1.5 transition-colors h-8 px-2 ${
        isLiked
          ? "text-green-500 hover:bg-green-500/20"
          : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
      }`}
      onClick={(e) => {
        e.preventDefault();
        onLike();
      }}
    >
      <CheckIcon
        size={15}
        className="transition-transform group-active:scale-95"
      />
      <span className="text-xs font-medium">{count}</span>
    </Button>
  );
}
