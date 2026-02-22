"use client";

import {
  Preloaded,
  usePreloadedQuery,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import {
  Bookmark,
  MessageSquare,
  Share2,
  Users,
  CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { CreatePostDialog } from "../_component/dialogs/createPostDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";

export default function CommunityClient({
  preloadedCommunity,
}: {
  preloadedCommunity: Preloaded<typeof api.communities.getCommunityWithPosts>;
}) {
  const community = usePreloadedQuery(preloadedCommunity);
  const { isAuthenticated } = useConvexAuth();

  const isMember = useQuery(
    api.communities.isMember,
    community ? { communityId: community._id } : "skip",
  );

  const joinCommunity = useMutation(api.communities.joinCommunity);
  const leaveCommunity = useMutation(api.communities.leaveCommunity);
  const likePost = useMutation(api.posts.likes.likePost);

  if (!community)
    return <p className="text-muted-foreground p-8">Communauté introuvable.</p>;

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId });
  };

  const handleJoin = async () => {
    try {
      await joinCommunity({ communityId: community._id });
      toast.success(`Vous avez rejoint hallo/${community.name} !`);
    } catch {
      toast.error("Erreur lors de l'adhésion");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity({ communityId: community._id });
      toast.success(`Vous avez quitté hallo/${community.name}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-card border-b border-border flex max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            HL
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              hallo/{community.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {community.description}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {community.membersCount ?? 0} membres
              </span>
              <span>{community.postsCount ?? 0} posts</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              {isMember ? (
                <>
                  <CreatePostDialog communityId={community._id} />
                  {isMember.role !== "admin" && (
                    <Button variant="outline" size="sm" onClick={handleLeave}>
                      Quitter
                    </Button>
                  )}
                </>
              ) : (
                <Button size="sm" onClick={handleJoin}>
                  Rejoindre
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-2">
        <div className="flex flex-col">
          {community.posts.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-xl">
              <p className="text-muted-foreground mb-4">
                Aucun post pour le moment.
              </p>
              {isAuthenticated && isMember && (
                <CreatePostDialog
                  communityId={community._id}
                  trigger={
                    <span className="text-primary hover:underline cursor-pointer text-sm">
                      Soyez le premier à publier →
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
                    Posté par{" "}
                    <span className="text-primary hover:underline">
                      {post.authorName}
                    </span>{" "}
                    • {getRelativeTime(post._creationTime)}
                  </p>
                  <h2 className="font-semibold text-foreground text-base leading-snug mb-1">
                    {post.title}
                  </h2>
                  {post.content && (
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
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
    </div>
  );
}
