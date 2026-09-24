"use client";

import { ShareButton } from "@/components/ShareButton";
import { TranslateMenu } from "@/components/translate-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { useManualTranslate } from "@/hooks/use-manual-translate";
import { useTimeTranslations } from "@/hooks/use-time-translations";
import { Link } from "@/i18n/navigation";
import { getRelativeTime } from "@/lib/date";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction } from "convex/react";
import { CheckIcon, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PostBookmarkButton } from "../../_component/List/PostBookmarkButton";

type CommunityPost = {
  _id: Id<"posts">;
  slug: string;
  title: string;
  content?: string;
  authorName?: string;
  _creationTime: number;
  commentsCount?: number;
  likesCount?: number;
  userHasLiked?: boolean;
  isBookmarked?: boolean;
};

export function CommunityPostCard({
  post,
  communitySlug,
  onLikeAction,
}: {
  post: CommunityPost;
  communitySlug: string;
  onLikeAction: (postId: Id<"posts">) => void;
}) {
  const timeT = useTimeTranslations();
  const t = useTranslations("communities.post");

  const translatePost = useAction(api.posts.translate.translatePost);
  const { data, activeLang, pendingLang, translate, reset } =
    useManualTranslate(
      (lang) => translatePost({ postId: post._id, targetLanguage: lang }),
      { onError: () => toast.error(t("translateError")) },
    );

  const title = data?.title ?? post.title;
  const content = data?.content ?? post.content;

  return (
    <article
      key={post._id}
      className="block px-4 py-4 hover:bg-muted/30 transition-colors border-b border-border bg-background"
    >
      <Link
        href={`/communities/${communitySlug}/${post.slug}`}
        className="block"
      >
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
          <span className="text-primary hover:underline">
            {post.authorName}
          </span>
          •<span>{getRelativeTime(post._creationTime, timeT)}</span>
        </p>
        <h2 className="font-bold text-foreground text-xl leading-snug mb-1">
          {title}
        </h2>
        {content && (
          <p className="text-sm text-foreground/80 line-clamp-6 mb-2 whitespace-pre-wrap">
            {content}
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
          <span className="text-xs font-medium">{post.commentsCount ?? 0}</span>
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
            onLikeAction(post._id);
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

        <TranslateMenu
          activeLang={activeLang}
          pendingLang={pendingLang}
          onTranslateAction={translate}
          onResetAction={reset}
        />
      </div>
    </article>
  );
}
