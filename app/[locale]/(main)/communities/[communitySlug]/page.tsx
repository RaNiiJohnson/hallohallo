"use client";

import { ShareButton } from "@/components/ShareButton";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useAction, useConvexAuth, useMutation } from "convex/react";
import {
  Bookmark,
  CheckIcon,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Settings2,
  Trash,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CreatePostDialog } from "../_component/dialogs/createPostDialog";
import SkeletonCommunity from "./skeleton";

export default function CommunityClient() {
  const { communitySlug } = useParams();
  const router = useRouter();

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
  const deleteCommunity = useAction(api.communities.actions.deleteCommunity);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCommunity({ id: community._id });
      toast.success(t("deletedCommunity", { name: community.name }));
      router.push("/communities");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : t("error");
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
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
      <div className="bg-card border-b border-border max-w-4xl mx-auto">
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 select-none">
              {community.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name + badge + desktop actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">
                      {community.name}
                    </h1>
                    {isMember?.role === "admin" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-2 font-semibold tracking-wide shrink-0"
                      >
                        {t("admin").toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users size={11} className="shrink-0" />
                      <span className="font-medium text-foreground">
                        {community.membersCount ?? 0}
                      </span>
                      {t("members")}
                    </span>
                    <span>·</span>
                    <span>
                      <span className="font-medium text-foreground">
                        {community.postsCount ?? 0}
                      </span>{" "}
                      {t("posts")}
                    </span>
                  </div>
                </div>

                {/* Actions — desktop only */}
                {isAuthenticated && isMember !== undefined && (
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {isMember ? (
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
                        {isMember.role === "admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-muted-foreground hover:text-foreground"
                              >
                                <Settings2 size={13} />
                                <ChevronDown size={11} className="opacity-60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs text-muted-foreground">
                                Administration
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer whitespace-nowrap"
                                onClick={() => setDeleteDialogOpen(true)}
                              >
                                <Trash size={13} />
                                {t("deleteCommunity")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    ) : (
                      <Button size="sm" onClick={handleJoin}>
                        {t("join")}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {community.description}
              </p>

              {/* Actions — mobile only (below description) */}
              {isAuthenticated && isMember !== undefined && (
                <div className="flex sm:hidden items-center gap-2 mt-3 flex-wrap">
                  {isMember ? (
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
                      {isMember.role === "admin" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                              <Settings2 size={13} />
                              <ChevronDown size={11} className="opacity-60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Administration
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer whitespace-nowrap"
                              onClick={() => setDeleteDialogOpen(true)}
                            >
                              <Trash size={13} />
                              {t("deleteCommunity")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  ) : (
                    <Button size="sm" onClick={handleJoin}>
                      {t("join")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Delete confirmation dialog — rendered once, shared by both breakpoints */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("deleteDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialogDescription", { name: community.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="opacity-70">{t("deleting")}</span>
              ) : (
                <>
                  <Trash size={13} className="mr-1.5" />
                  {t("deleteDialogConfirm")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
