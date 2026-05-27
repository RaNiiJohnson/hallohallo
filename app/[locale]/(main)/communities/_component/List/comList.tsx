"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useConvexAuth, useMutation } from "convex/react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { ComListSkeleton } from "./ComListSkeleton";
import { EmptyCommunities } from "./EmptyCommunities";
import { ModeToggle } from "./ModeToggle";
import { PostCard } from "./PostCard";
import { PostPagination } from "./PostPagination";
import { PAGE_SIZE, SortMode } from "./types";
import { usePostsQuery } from "./usePostsQuery";

export default function ComList() {
  const { isAuthenticated } = useConvexAuth();
  const likePost = useMutation(api.posts.likes.mutations.likePost);
  const [seed] = useState(() => crypto.randomUUID());

  const [filters, setFilters] = useQueryStates({
    mode: parseAsString.withDefault("shuffle"),
    page: parseAsInteger.withDefault(1),
  });

  const mode = filters.mode as SortMode;
  const currentPage = filters.page;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data: result, isLoading: loading } = usePostsQuery(
    mode,
    offset,
    seed,
  );

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId });
  };

  const handleModeChange = (newMode: SortMode) =>
    setFilters({ mode: newMode, page: 1 });
  const goToPage = (page: number) => {
    if (!loading) setFilters({ page });
  };

  return (
    <div>
      <ModeToggle mode={mode} onChange={handleModeChange} />

      {result === undefined ? (
        <ComListSkeleton />
      ) : result === null ? (
        <EmptyCommunities />
      ) : (
        <>
          {result.posts.length === 0 ? (
            <div className="px-4 mt-4">
              <p className="text-muted-foreground mb-4 text-center">
                Aucun post pour le moment.
              </p>
            </div>
          ) : (
            result.posts.map((post) => (
              <PostCard key={post._id} post={post} onLike={handleLike} />
            ))
          )}

          <PostPagination
            mode={mode}
            result={result}
            currentPage={currentPage}
            loading={loading}
            onGoToPage={goToPage}
          />
        </>
      )}
    </div>
  );
}
