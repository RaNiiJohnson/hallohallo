"use client";

import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import {
  ArrowDownUp,
  Bookmark,
  Calendar,
  CheckIcon,
  ChevronRight,
  Flame,
  MessageSquare,
  Shuffle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { ShareButton } from "@/components/ShareButton";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRicherStableQuery } from "@/lib/useStableQuery";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { parseAsString, parseAsInteger, useQueryStates } from "nuqs";
import { ButtonGroup } from "@/components/ui/button-group";

export function ComListSkeleton() {
  return (
    <div className="flex flex-col gap-4 items-center">
      {Array.from({ length: 1 }).map((_, i) => (
        <div
          key={i}
          className="w-full max-w-4xl bg-card dark:bg-card/35 border border-border rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
          {/* Posts */}
          <div className="divide-y ml-11 divide-border">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="px-4 py-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-28 mt-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCommunities() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 dark:bg-card/20 border border-dashed border-border rounded-2xl w-full max-w-4xl animate-in fade-in zoom-in duration-500 mx-auto">
      <div className="relative mb-6">
        <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-blue-500/20 rounded-full blur-xl opacity-50"></div>
        <div className="relative bg-background p-5 rounded-full border border-border shadow-sm">
          <Users className="w-10 h-10 text-primary" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">
        Aucune communauté pour le moment
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-8">
        Créez votre première communauté dès maintenant et commencez à rassembler
        des personnes partageant vos intérêts.{" "}
        {isLoading
          ? ""
          : isAuthenticated
            ? ""
            : "Connectez-vous dès maintenant."}
      </p>
    </div>
  );
}

// ─── Pagination helpers

/** Returns the visible page numbers with -1 for ellipsis gaps */
function getPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  if (currentPage > 3) pages.push(-1); // ellipsis

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (currentPage < totalPages - 2) pages.push(-1); // ellipsis

  pages.push(totalPages);
  return pages;
}

export default function ComList() {
  const { isAuthenticated } = useConvexAuth();
  const likePost = useMutation(api.posts.likes.likePost);
  const pageSize = 10;

  // ─── nuqs URL state
  const [filters, setFilters] = useQueryStates({
    mode: parseAsString.withDefault("shuffle"),
    page: parseAsInteger.withDefault(1),
  });

  // Stable seed per mount — not persisted in URL
  const [seed] = useState(() => crypto.randomUUID());

  const currentPage = filters.page;
  const offset = (currentPage - 1) * pageSize;
  const mode = filters.mode;

  // ── Shuffle mode
  const { data: shuffledResult, isLoading: shuffleLoading } =
    useRicherStableQuery(
      api.posts.posts.getShuffledPosts,
      mode === "shuffle" ? { seed, offset, numItems: pageSize } : "skip",
    );

  // ── Recent mode (desc)
  const { data: recentResult, isLoading: recentLoading } = useRicherStableQuery(
    api.posts.posts.getSortedPosts,
    mode === "recent"
      ? { order: "desc" as const, offset, numItems: pageSize }
      : "skip",
  );

  // ── Oldest mode (asc)
  const { data: oldestResult, isLoading: oldestLoading } = useRicherStableQuery(
    api.posts.posts.getSortedPosts,
    mode === "oldest"
      ? { order: "asc" as const, offset, numItems: pageSize }
      : "skip",
  );

  // ── Top (most liked) mode
  const { data: topResult, isLoading: topLoading } = useRicherStableQuery(
    api.posts.posts.getSortedByLikes,
    mode === "top" ? { offset, numItems: pageSize } : "skip",
  );

  const resultMap = {
    shuffle: shuffledResult,
    recent: recentResult,
    oldest: oldestResult,
    top: topResult,
  };
  const loadingMap = {
    shuffle: shuffleLoading,
    recent: recentLoading,
    oldest: oldestLoading,
    top: topLoading,
  };
  const result = resultMap[mode as keyof typeof resultMap] ?? shuffledResult;
  const loading = loadingMap[mode as keyof typeof loadingMap] ?? shuffleLoading;

  // Show numbered pagination for non-shuffle modes
  const useNumberedPagination = mode !== "shuffle";

  // ── Pagination numbers for numbered modes
  const totalPages = useMemo(() => {
    if (!result || !useNumberedPagination) return 0;
    return Math.ceil(result.totalCount / pageSize);
  }, [result, useNumberedPagination, pageSize]);

  const visiblePages = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // ── Handlers
  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId });
  };

  const goToPage = (page: number) => {
    if (loading) return;
    setFilters({ page });
  };

  if (result === undefined) {
    return <ComListSkeleton />;
  }

  if (result === null) {
    return <EmptyCommunities />;
  }

  return (
    <div>
      {/* ── Mode toggle */}
      <ButtonGroup className="flex w-full md:w-fit justify-between items-center px-4 py-3 max-w-4xl mx-auto">
        <Button
          variant={mode === "shuffle" ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => setFilters({ mode: "shuffle", page: 1 })}
        >
          <Shuffle size={14} />
          <span className="md:block hidden">Aléatoire</span>
        </Button>
        <Button
          variant={mode === "recent" ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => setFilters({ mode: "recent", page: 1 })}
        >
          <ArrowDownUp size={14} />
          <span className="md:block hidden">Récent</span>
        </Button>
        <Button
          variant={mode === "oldest" ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => setFilters({ mode: "oldest", page: 1 })}
        >
          <Calendar size={14} />

          <span className="md:block hidden">Ancien</span>
        </Button>
        <Button
          variant={mode === "top" ? "default" : "outline"}
          size="xs"
          className="gap-1.5 flex-1 md:flex-initial"
          onClick={() => setFilters({ mode: "top", page: 1 })}
        >
          <Flame size={14} />

          <span className="md:block hidden">Top</span>
        </Button>
      </ButtonGroup>

      {/* ── Posts */}
      {result.posts.length === 0 ? (
        <div className="px-4">
          <p className="text-muted-foreground mb-4">
            Aucun post pour le moment.
          </p>
        </div>
      ) : (
        result.posts.map((post) => (
          <div
            key={post._id}
            className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background max-w-4xl mx-auto"
          >
            <div className="flex sm:flex-row flex-col text-xs text-muted-foreground mb-2">
              <div className="flex flex-wrap items-center gap-1">
                <Link
                  href={`/hl/${post.author?.slug}`}
                  className="flex items-center gap-1"
                >
                  <Avatar>
                    <AvatarImage
                      src={post.author?.imageUrl || "/random-user.png"}
                    />
                    <AvatarFallback>
                      {post.authorName?.slice(0, 2)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-primary hover:underline">
                    {post.authorName}
                  </span>
                </Link>
                {"  "}
                <ChevronRight className="size-3" />
                {"  "}
                <Link
                  href={`/communities/${post.communitySlug}`}
                  className="font-semibold text-accent-foreground hover:underline"
                >
                  {post.communityName}
                </Link>
              </div>
            </div>
            <Link
              href={`/communities/${post.communitySlug}/${post.slug}`}
              className="block group"
            >
              <h2 className="font-semibold text-foreground text-base leading-snug group-hover:underline">
                {post.title}
              </h2>
              {post.content && (
                <p className="text-sm text-foreground/80 line-clamp-6 mb-2 mt-2 whitespace-pre-wrap">
                  {post.content}
                </p>
              )}

              <span className="text-xs text-muted-foreground mt-2">
                {getRelativeTime(post._creationTime ?? "")}
              </span>
            </Link>
            <div className="flex items-center gap-1 mt-2">
              <Link
                href={`/communities/${post.communitySlug}/${post.slug}#comments`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className:
                    "group flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors h-8 px-2",
                })}
              >
                <MessageSquare
                  size={15}
                  className="transition-transform group-active:scale-95"
                />
                <span className="text-xs font-medium">
                  {post?.commentsCount ?? 0}
                </span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                className={`group flex items-center gap-1.5 transition-colors h-8 px-2 ${
                  post?.userHasLiked
                    ? "text-green-500  hover:bg-green-500/20"
                    : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLike(post?._id);
                }}
              >
                <CheckIcon
                  size={15}
                  className="transition-transform group-active:scale-95"
                />
                <span className="text-xs font-medium">
                  {post.likesCount ?? 0}
                </span>
              </Button>

              <ShareButton
                text={post.title}
                url={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/communities/${post.communitySlug}/${post.slug}`
                    : ""
                }
                variant="ghost"
                className="group flex items-center gap-1.5 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-colors h-8 px-2"
              />

              <Button
                variant="ghost"
                size="sm"
                className="group flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors h-8 px-2 ml-auto"
              >
                <Bookmark
                  size={15}
                  className="transition-transform group-active:scale-95"
                />
              </Button>
            </div>
          </div>
        ))
      )}

      {/* ── Pagination */}
      <Pagination className="py-4">
        <PaginationContent>
          {!useNumberedPagination ? (
            /* ── Shuffle: simple < > */
            <>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={
                    !result.hasPrevPage || loading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={
                    !result.hasMore || loading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </>
          ) : (
            /* ── Numbered pages 1 2 3 ... */
            <>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  className={
                    !result.hasPrevPage || loading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {visiblePages.map((pageNum, idx) =>
                pageNum === -1 ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={pageNum === currentPage}
                      onClick={() => goToPage(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  className={
                    !result.hasMore || loading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
