"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Flame,
  Shuffle,
  Bookmark,
} from "lucide-react";
import { SortMode } from "./types";
import { useTranslations } from "next-intl";

const FILTERS: { mode: SortMode; icon: React.ElementType }[] = [
  { mode: "shuffle", icon: Shuffle },
  { mode: "oldest", icon: ArrowUpNarrowWide },
  { mode: "recent", icon: ArrowDownNarrowWide },
  { mode: "top", icon: Flame },
  { mode: "bookmarked", icon: Bookmark },
];

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (m: SortMode) => void;
}) {
  const t = useTranslations("sortMode");

  return (
    <ButtonGroup className="flex w-full md:w-fit justify-between items-center px-4 py-3 max-w-4xl mx-auto">
      {FILTERS.map(({ mode: m, icon: Icon }) => (
        <Button
          key={m}
          variant={mode === m ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => onChange(m)}
        >
          <Icon size={14} />
          <span className="md:block hidden">{t(m)}</span>
        </Button>
      ))}
    </ButtonGroup>
  );
}
