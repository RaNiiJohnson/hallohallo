"use client";

import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import {
  Bookmark,
  CheckIcon,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";

interface IsMemberProps {
  _id: Id<"communities">;
  name: string;
}

function IsMember({ _id, name }: IsMemberProps) {
  const joinCommunity = useMutation(api.communities.joinCommunity);
  const leaveCommunity = useMutation(api.communities.leaveCommunity);
  const isMember = useQuery(
    api.communities.isMember,
    _id ? { communityId: _id } : "skip",
  );

  const handleJoin = async () => {
    try {
      await joinCommunity({ communityId: _id });
      toast.success(`Vous avez rejoint  ${name} !`);
    } catch {
      toast.error("Erreur lors de l'adhésion");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity({ communityId: _id });
      toast.success(`Vous avez quitté  ${name}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur";
      toast.error(message);
    }
  };

  if (isMember === undefined || isMember === null) {
    return null;
  }

  return isMember ? (
    isMember.role !== "admin" ? (
      <Button variant="destructive" size="sm" onClick={handleLeave}>
        <Users
          size={15}
          className="transition-transform group-active:scale-95"
        />
        <span className="text-xs font-medium">Quitter</span>
      </Button>
    ) : (
      <span>Votre communauté</span>
    )
  ) : (
    <Button variant="ghost" size="sm" onClick={handleJoin}>
      <Users size={15} className="transition-transform group-active:scale-95" />
      <span className="text-xs font-medium">Rejoindre</span>
    </Button>
  );
}

export default function ComList() {
  const { isAuthenticated } = useConvexAuth();
  const likePost = useMutation(api.posts.likes.likePost);
  const { results, loadMore, status } = usePaginatedQuery(
    api.communities.getCommunitiesPreview,
    {},
    { initialNumItems: 10 },
  );

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId });
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      {results?.map((community) => (
        <div
          key={community._id}
          className="w-full max-w-4xl bg-card dark:bg-card/35 border border-border rounded-xl overflow-hidden"
        >
          {/* Header communauté */}
          <Link
            href={`/communities/${community.slug}`}
            className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                HL
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {community.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {community.membersCount ?? 0} membres
                  </span>
                  <span>{community.postsCount ?? 0} posts</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-primary font-medium hover:underline">
              <IsMember _id={community._id} name={community.name} />
            </span>
          </Link>

          {/* Posts récents */}
          <div className="divide-y ml-11 divide-border">
            {community.recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                Aucun post pour le moment.
              </p>
            ) : (
              community.recentPosts.map((post) => (
                <article
                  key={post._id}
                  className="px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Link
                    href={`/communities/${community.slug}/${post.slug}`}
                    className="block mb-3"
                  >
                    <h2 className="font-semibold text-foreground text-base leading-snug mb-1">
                      {post.title}
                    </h2>
                    {post.content && (
                      <p className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                        {post.content}
                      </p>
                    )}
                  </Link>

                  <p className="text-xs text-muted-foreground mb-2">
                    Posté par{" "}
                    <span className="text-primary hover:underline">
                      {post.authorName}
                    </span>{" "}
                    • {getRelativeTime(post._creationTime)}
                  </p>

                  {/* Actions */}
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
                          ? "text-green-500 hover:bg-green-500/20"
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

                    <Button
                      variant="ghost"
                      size="sm"
                      className="group flex items-center gap-1.5 text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-colors h-8 px-2"
                    >
                      <Share2
                        size={15}
                        className="transition-transform group-active:scale-95"
                      />
                      <span className="text-xs font-medium hidden sm:inline">
                        Partager
                      </span>
                    </Button>

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
      ))}

      {status === "CanLoadMore" && (
        <Button variant="outline" onClick={() => loadMore(10)} className="mt-2">
          Charger plus
        </Button>
      )}

      {status === "LoadingMore" && (
        <p className="text-sm text-muted-foreground mt-4">Chargement...</p>
      )}
    </div>
  );
}
