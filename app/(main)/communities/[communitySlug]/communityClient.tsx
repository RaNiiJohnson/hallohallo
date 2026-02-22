"use client";

import {
  Preloaded,
  usePreloadedQuery,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import { ArrowUp, Bookmark, MessageSquare, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { CreatePostDialog } from "../_component/dialogs/createPostDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

  if (!community)
    return <p className="text-muted-foreground p-8">Communauté introuvable.</p>;

  const handleJoin = async () => {
    try {
      await joinCommunity({ communityId: community._id });
      toast.success(`Vous avez rejoint r/${community.name} !`);
    } catch {
      toast.error("Erreur lors de l'adhésion");
    }
  };

  const handleLeave = async () => {
    try {
      await leaveCommunity({ communityId: community._id });
      toast.success(`Vous avez quitté r/${community.name}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                r/
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  r/{community.name}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLeave}
                        >
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
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-3">
          {community.posts.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
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
              <Link
                href={`/communities/${community.slug}/${post.slug}`}
                key={post._id}
                className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs text-muted-foreground mb-1">
                  Posté par{" "}
                  <span className="text-primary hover:underline">
                    u/{post.authorName}
                  </span>{" "}
                  • {getRelativeTime(post._creationTime)}
                </p>
                <h2 className="font-semibold text-foreground text-base leading-snug mb-1">
                  {post.title}
                </h2>
                {post.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
                    <ArrowUp size={14} className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground min-w-[1.5rem] text-center">
                      {post.likesCount ?? 0}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <MessageSquare size={14} />
                    {post.commentsCount ?? 0}
                  </span>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    <Bookmark size={14} />
                  </button>
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors"
                  >
                    <Share2 size={14} />
                    <span>Partager</span>
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
