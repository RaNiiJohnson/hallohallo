"use client";

import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { ArrowUp, Bookmark, MessageSquare, Share2, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ComList() {
  const { results, loadMore, status } = usePaginatedQuery(
    api.communities.getCommunitiesPreview,
    {},
    { initialNumItems: 10 },
  );

  return (
    <div className="flex flex-col sm:gap-6 items-center">
      {results?.map((community) => (
        <div
          key={community._id}
          className="w-full max-w-3xl bg-card border border-border sm:rounded-xl overflow-hidden"
        >
          {/* Header communauté */}
          <Link
            href={`/communities/${community.slug}`}
            className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                r/
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  r/{community.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {community.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={13} />
                {community.membersCount ?? 0}
              </span>
              <span>{community.postsCount ?? 0} posts</span>
            </div>
          </Link>

          {/* Posts récents de la communauté */}
          <div className="divide-y divide-border">
            {community.recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                Aucun post pour le moment.
              </p>
            ) : (
              community.recentPosts.map((post) => (
                <Link
                  href={`/communities/${community.slug}/${post.slug}`}
                  key={post._id}
                  className="block p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Author + time */}
                  <p className="text-xs text-muted-foreground mb-1">
                    Posté par{" "}
                    <span className="text-primary hover:underline">
                      u/{post.authorName}
                    </span>{" "}
                    • {getRelativeTime(post._creationTime)}
                  </p>

                  {/* Title */}
                  <h2 className="font-semibold text-foreground text-base leading-snug mb-1">
                    {post.title}
                  </h2>

                  {/* Preview */}
                  {post.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
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

                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors">
                      <Bookmark size={14} />
                    </button>

                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors">
                      <Share2 size={14} />
                      <span>Partager</span>
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Voir plus */}
          <Link
            href={`/communities/${community.slug}`}
            className="block text-center text-xs text-primary hover:underline p-3 border-t border-border"
          >
            Voir tous les posts →
          </Link>
        </div>
      ))}

      {/* Load more */}
      {status === "CanLoadMore" && (
        <Button variant="outline" onClick={() => loadMore(10)} className="mt-4">
          Charger plus
        </Button>
      )}

      {status === "LoadingMore" && (
        <p className="text-sm text-muted-foreground mt-4">Chargement...</p>
      )}
    </div>
  );
}
