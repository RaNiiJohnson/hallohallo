"use client";

import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Suspense } from "react";
import ComFilters from "./_component/comFilters";
import { CreateCommunityDialog } from "./_component/dialogs/createComDialog";
import { useConvexAuth, useMutation } from "convex/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRicherStableQuery } from "@/lib/useStableQuery";
import {
  Bookmark,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { getRelativeTime } from "@/lib/date";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";

export default function Page() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const likePost = useMutation(api.posts.likes.likePost);
  const [seed] = useState(() => Math.random().toString(36).slice(2));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: result, isLoading: loading } = useRicherStableQuery(
    api.posts.posts.getShuffledPosts,
    {
      seed,
      offset: (currentPage - 1) * pageSize,
      numItems: pageSize,
    },
  );

  const handleLike = async (postId: Id<"posts">) => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId });
  };

  if (
    !result ||
    result.posts === null ||
    result.posts === undefined ||
    loading
  ) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto lg:px-4 sm:px-2 py-8">
        <div className="relative">
          <Suspense
            fallback={
              <div className="space-y-6">
                {/* <JobFiltersSkeleton /> */}
                {/* <ComFilters /> */}
                loading
              </div>
            }
          >
            <ComFilters />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Communautés</h2>
              </div>
              {isAuthenticated && !isLoading && <CreateCommunityDialog />}
            </div>
            <div>
              {result.posts.length === 0 ? (
                <div>
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
                    <div className="text-xs text-muted-foreground flex mb-2">
                      <div className="flex items-center gap-1">
                        Posté par{" "}
                        <span className="text-primary hover:underline">
                          {post.authorName}
                        </span>
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
                      <span className="flex-1"></span>
                      {getRelativeTime(post._creationTime ?? "")}
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
                  </div>
                ))
              )}

              <div className="flex justify-center gap-4 mx-auto w-full py-4">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!result.hasPrevPage || loading}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!result.hasMore || loading}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </Suspense>
        </div>
        {/* Call to action */}
        {/* <div className="text-center flex flex-col items-center  mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">communauté hallohallo</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto"></p>
          {isAuthenticated ? (
            <PublishJobDialog
              trigger={<Button size="lg">Publier une offre</Button>}
            />
          ) : (
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              S&apos;inscrire pour publier
            </Link>
          )}
        </div>*/}
      </div>
    </div>
  );
}

// export default function ShuffledPostsFeed() {

//   return (

//   );
// }
