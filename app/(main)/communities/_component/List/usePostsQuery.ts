import { useRicherStableQuery } from "@/lib/useStableQuery";
import { api } from "@convex/_generated/api";
import { SortMode, PAGE_SIZE } from "./types";

export function usePostsQuery(mode: SortMode, offset: number, seed: string) {
  const shuffle = useRicherStableQuery(
    api.posts.posts.getShuffledPosts,
    mode === "shuffle" ? { seed, offset, numItems: PAGE_SIZE } : "skip",
  );
  const recent = useRicherStableQuery(
    api.posts.posts.getSortedPosts,
    mode === "recent"
      ? { order: "desc" as const, offset, numItems: PAGE_SIZE }
      : "skip",
  );
  const oldest = useRicherStableQuery(
    api.posts.posts.getSortedPosts,
    mode === "oldest"
      ? { order: "asc" as const, offset, numItems: PAGE_SIZE }
      : "skip",
  );
  const top = useRicherStableQuery(
    api.posts.posts.getSortedByLikes,
    mode === "top" ? { offset, numItems: PAGE_SIZE } : "skip",
  );

  const dataMap = { shuffle, recent, oldest, top };
  return dataMap[mode];
}
