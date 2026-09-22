import { ShareButton } from "@/components/ShareButton";
import { TranslateMenu } from "@/components/translate-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { useManualTranslate } from "@/hooks/use-manual-translate";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction } from "convex/react";
import { ChevronRight, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LikeButton } from "../likeButton";
import { PostBookmarkButton } from "./PostBookmarkButton";
import { Post } from "./types";

export function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: (id: Id<"posts">) => void;
}) {
  const timeT = useTimeTranslations();
  const te = useTranslations("common");

  const translatePost = useAction(api.posts.translate.translatePost);
  const { data, activeLang, pendingLang, translate, reset } =
    useManualTranslate(
      (lang) => translatePost({ postId: post._id, targetLanguage: lang }),
      { onError: () => toast.error(te("translateError")) },
    );

  const title = data?.title ?? post.title;
  const content = data?.content ?? post.content;

  return (
    <div className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background max-w-4xl mx-auto">
      <div className="flex sm:flex-row flex-col text-xs text-muted-foreground mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/hl/${post.author.slug}`}
            className="flex items-center gap-1.5 group/author"
          >
            <Avatar className="size-5">
              <AvatarImage src={post.author.image ?? "/random-user.png"} />
              <AvatarFallback className="text-[10px]">
                {post.authorName?.slice(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-foreground/80 group-hover/author:text-foreground group-hover/author:underline">
              {post.authorName}
            </span>
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/50" />
          <Link
            href={`/communities/${post.communitySlug}`}
            className="text-primary font-medium hover:underline"
          >
            {post.communityName}
          </Link>
        </div>
      </div>

      <Link
        href={`/communities/${post.communitySlug}/${post.slug}`}
        className="block group"
      >
        <h2 className="font-bold text-foreground text-base leading-snug group-hover:underline">
          {title}
        </h2>
        {content && (
          <p className="text-sm text-foreground/70 line-clamp-6 mt-1 whitespace-pre-wrap">
            {content}
          </p>
        )}
        <span className="block text-xs text-muted-foreground mt-1.5">
          {getRelativeTime(post._creationTime, timeT)}
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

        <div className="ml-auto">
          <TranslateMenu
            activeLang={activeLang}
            pendingLang={pendingLang}
            onTranslateAction={translate}
            onResetAction={reset}
          />
        </div>
      </div>
    </div>
  );
}
