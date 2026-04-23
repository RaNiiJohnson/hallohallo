import { getRelativeTime } from "@/lib/date";
import { ChevronRight, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Id } from "@convex/_generated/dataModel";
import { ShareButton } from "@/components/ShareButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Post } from "./types";
import { PostBookmarkButton } from "./PostBookmarkButton";
import { LikeButton } from "../likeButton";

export function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: (id: Id<"posts">) => void;
}) {
  return (
    <div className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background max-w-4xl mx-auto">
      <div className="flex sm:flex-row flex-col text-xs text-muted-foreground mb-2">
        <div className="flex flex-wrap items-center gap-1">
          <Link
            href={`/hl/${post.author?.slug}`}
            className="flex items-center gap-1"
          >
            <Avatar>
              <AvatarImage src={post.author?.imageUrl || "/random-user.png"} />
              <AvatarFallback>
                {post.authorName?.slice(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-primary hover:underline">
              {post.authorName}
            </span>
          </Link>
          <ChevronRight className="size-3" />
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
          <span className="text-xs font-medium">{post.commentsCount ?? 0}</span>
        </Link>

        <LikeButton
          initialCount={post.likesCount ?? 0}
          onLike={() => onLike(post._id)}
          initialIsLiked={post.userHasLiked}
        />

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

        <PostBookmarkButton
          postId={post._id}
          initialBookmark={post.isBookmarked}
        />
      </div>
    </div>
  );
}
