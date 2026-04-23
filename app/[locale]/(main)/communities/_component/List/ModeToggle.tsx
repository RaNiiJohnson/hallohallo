"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Flame, Shuffle, Bookmark } from "lucide-react";
import { SortMode } from "./types";

const FILTERS: { mode: SortMode; label: string; icon: React.ElementType }[] = [
  { mode: "shuffle", label: "Aléatoire", icon: Shuffle },
  { mode: "oldest", label: "Ancien", icon: ArrowUpNarrowWide },
  { mode: "recent", label: "Récent", icon: ArrowDownNarrowWide },
  { mode: "top", label: "Top", icon: Flame },
  { mode: "bookmarked", label: "Favoris", icon: Bookmark },
];

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (m: SortMode) => void;
}) {
  return (
    <ButtonGroup className="flex w-full md:w-fit justify-between items-center px-4 py-3 max-w-4xl mx-auto">
      {FILTERS.map(({ mode: m, label, icon: Icon }) => (
        <Button
          key={m}
          variant={mode === m ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => onChange(m)}
        >
          <Icon size={14} />
          <span className="md:block hidden">{label}</span>
        </Button>
      ))}
    </ButtonGroup>
  );
}
