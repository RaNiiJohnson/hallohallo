"use client";

import { ShareButton } from "@/components/ShareButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth, useMutation } from "convex/react";
import {
  Bookmark,
  CheckIcon,
  ChevronRight,
  MessageSquare,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CreatePostDialog } from "../_component/dialogs/createPostDialog";
import SkeletonCommunity from "./skeleton";

export default function CommunityClient() {
  const { communitySlug } = useParams();
  const community = useQuery(api.communities.queries.getCommunityWithPosts, {
    slug: communitySlug as string,
  });
  const { isAuthenticated } = useConvexAuth();

  const isMember = useQuery(
    api.communities.queries.isMember,
    community ? { communityId: community._id } : "skip",
  );

  const joinCommunity = useMutation(api.communities.mutations.joinCommunity);
  const leaveCommunity = useMutation(api.communities.mutations.leaveCommunity);
  const likePost = useMutation(api.posts.likes.mutations.likePost);

  const timeT = useTimeTranslations();
  const t = useTranslations("communities.community");

  if (community === undefined) {
    return <SkeletonCommunity />;
  }

  if (community === null) {
    return <p className="text-muted-foreground p-8">{t("notFound")}</p>;
  }

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error(t("loginToLike"));
    await likePost({ postId });
  };

  const handleJoin = async () => {
    try {
      await joinCommunity({ communityId: community._id });
      toast.success(t("joined", { name: community.name }));
    } catch {
      toast.error(t("joinError"));
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity({ communityId: community._id });
      toast.success(t("left", { name: community.name }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t("error");
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {" "}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 sm:mb-4  px-4 pt-2 sm:pt-8">
        <Link
          href="/communities"
          className="hover:text-foreground transition-colors"
        >
          {t("breadcrumbs")}
        </Link>
        <span>
          <ChevronRight className="w-4 h-4" />
        </span>
        <span className="text-foreground font-medium line-clamp-1">
          {community.name}
        </span>
      </div>
      <div className="bg-card border-b border-border flex max-w-4xl mx-auto px-4 py-6">
        {" "}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            HL
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {community.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {community.description}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {community.membersCount ?? 0} {t("members")}
              </span>
              <span>
                {community.postsCount ?? 0} {t("posts")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {isAuthenticated && (
                <>
                  {isMember !== undefined ? (
                    isMember ? (
                      <>
                        <CreatePostDialog communityId={community._id} />
                        {isMember.role !== "admin" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLeave}
                          >
                            {t("leave")}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button size="sm" onClick={handleJoin}>
                        {t("join")}
                      </Button>
                    )
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto py-2">
        <div className="flex flex-col">
          {community.posts.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-xl">
              <p className="text-muted-foreground mb-4">{t("emptyPosts")}</p>
              {isAuthenticated && isMember && (
                <CreatePostDialog
                  communityId={community._id}
                  trigger={
                    <span className="text-primary hover:underline cursor-pointer text-sm">
                      {t("firstToPost")}
                    </span>
                  }
                />
              )}
            </div>
          ) : (
            community.posts.map((post) => (
              <article
                key={post._id}
                className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background"
              >
                <Link
                  href={`/communities/${community.slug}/${post.slug}`}
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
                    href={`/communities/${community.slug}/${post.slug}#comments`}
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
                    <span className="text-xs font-medium">
                      {post.likesCount ?? 0}
                    </span>
                  </Button>

                  <ShareButton
                    text={post.title}
                    url={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/communities/${community.slug}/${post.slug}`
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
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
