"use client";

import { ShareButton } from "@/components/ShareButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useConvexAuth, useMutation, usePaginatedQuery } from "convex/react";
import { CheckIcon, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CreatePostDialog } from "../../_component/dialogs/createPostDialog";
import { PostBookmarkButton } from "../../_component/List/PostBookmarkButton";
import clsx from "clsx";

interface CommunityPostListProps {
  communitySlug: string;
  communityId: Id<"communities">;
  isMember: boolean;
}

export function CommunityPostList({
  communitySlug,
  communityId,
  isMember,
}: CommunityPostListProps) {
  const { isAuthenticated } = useConvexAuth();
  const timeT = useTimeTranslations();
  const t = useTranslations("communities.community");

  const { results, status, loadMore } = usePaginatedQuery(
    api.communities.queries.getCommunityPosts,
    { communitySlug },
    { initialNumItems: 10 }
  );

  const likePost = useMutation(api.posts.likes.mutations.likePost);

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error(t("loginToLike"));
    await likePost({ postId });
  };

  const isLoading = status === "LoadingFirstPage";

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-background rounded-xl">
        <p className="text-muted-foreground mb-4">{t("emptyPosts")}</p>
        {isAuthenticated && isMember && (
          <CreatePostDialog
            communityId={communityId}
            trigger={
              <span className="text-primary hover:underline cursor-pointer text-sm">
                {t("firstToPost")}
              </span>
            }
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {results.map((post) => (
        <article
          key={post._id}
          className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background"
        >
          <Link
            href={`/communities/${communitySlug}/${post.slug}`}
            className="block"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {" "}
              <span className="text-primary hover:underline">
                {post.authorName}
              </span>{" "}
              • {getRelativeTime(post._creationTime, timeT)}
            </p>
            <h2 className="font-semibold text-foreground text-base leading-snug mb-1">
              {post.title}
            </h2>
            {post.content && (
              <p className="text-sm text-foreground/80 line-clamp-6 mb-2 whitespace-pre-wrap">
                {post.content}
              </p>
            )}
          </Link>
          <div className="flex items-center gap-1 mt-2">
            <Link
              href={`/communities/${communitySlug}/${post.slug}#comments`}
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
                {post.commentsCount ?? 0}
              </span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className={`group flex items-center gap-1.5 transition-colors h-8 px-2 ${
                post.userHasLiked
                  ? "text-green-500  hover:bg-green-500/20"
                  : "text-muted-foreground hover:text-green-500 hover:bg-green-500/10"
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleLike(post._id);
              }}
            >
              <CheckIcon
                size={15}
                className="transition-transform group-active:scale-95"
              />
              <span className="text-xs font-medium">{post.likesCount ?? 0}</span>
            </Button>

            <ShareButton
              text={post.title}
              url={
                typeof window !== "undefined"
                  ? `${window.location.origin}/communities/${communitySlug}/${post.slug}`
                  : ""
              }
              variant="ghost"
              className="group flex items-center gap-1.5 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-colors h-8 px-2"
            />

            <PostBookmarkButton
              postId={post._id}
              initialBookmark={post.isBookmarked}
            />
          </div>
        </article>
      ))}

      {status !== "Exhausted" && (
        <Button
          variant="outline"
          onClick={() => loadMore(10)}
          className={clsx("mx-auto flex items-center mt-5 mb-5", {
            "cursor-not-allowed opacity-50": status !== "CanLoadMore",
          })}
          disabled={status !== "CanLoadMore"}
        >
          {status === "LoadingMore" ? t("loading") : t("loadMore")}
        </Button>
      )}
    </div>
  );
}
