"use client";

import {
  Preloaded,
  usePreloadedQuery,
  useMutation,
  useConvexAuth,
} from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import {
  ArrowUp,
  Bookmark,
  MessageSquare,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@convex/_generated/dataModel";

// ─── Like Button ─────────────────────────────────────────

function LikeButton({ count, onLike }: { count: number; onLike: () => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-full px-3 py-1">
      <button
        onClick={onLike}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowUp size={14} />
      </button>
      <span className="text-xs font-semibold text-foreground min-w-[1.5rem] text-center">
        {count}
      </span>
    </div>
  );
}

// ─── Reply Item ───────────────────────────────────────────

function ReplyItem({
  reply,
}: {
  reply: {
    _id: Id<"postCommentReplies">;
    _creationTime: number;
    authorName?: string;
    content: string;
    likes: { userId: string }[];
    likesCount: number;
  } | null;
}) {
  const likeReply = useMutation(api.posts.likes.likeReply);
  const { isAuthenticated } = useConvexAuth();

  if (!reply) return null;

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likeReply({ replyId: reply._id });
  };

  return (
    <div className="ml-8 pl-4 border-l border-border py-2">
      <p className="text-xs text-muted-foreground mb-1">
        <span className="text-primary font-medium">u/{reply.authorName}</span> •{" "}
        {getRelativeTime(reply._creationTime)}
      </p>
      <p className="text-sm text-foreground mb-2">{reply.content}</p>
      <LikeButton count={reply.likesCount} onLike={handleLike} />
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────

function CommentItem({
  comment,
}: {
  comment: {
    _id: Id<"postComments">;
    _creationTime: number;
    authorName?: string;
    content: string;
    likes: { userId: string }[];
    likesCount: number;
    replies: ({
      _id: Id<"postCommentReplies">;
      _creationTime: number;
      authorName?: string;
      content: string;
      likes: { userId: string }[];
      likesCount: number;
    } | null)[];
  } | null;
}) {
  const likeComment = useMutation(api.posts.likes.likeComment);
  const addReply = useMutation(api.posts.comments.addReply);
  const { isAuthenticated } = useConvexAuth();

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!comment) return null;

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likeComment({ commentId: comment._id });
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await addReply({ commentId: comment._id, content: replyContent });
      setReplyContent("");
      setShowReplyForm(false);
      setShowReplies(true);
      toast.success("Réponse ajoutée !");
    } catch {
      toast.error("Erreur lors de l'ajout de la réponse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validReplies = comment.replies.filter(Boolean);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Author */}
      <p className="text-xs text-muted-foreground mb-1">
        <span className="text-primary font-medium">u/{comment.authorName}</span>{" "}
        • {getRelativeTime(comment._creationTime)}
      </p>

      {/* Content */}
      <p className="text-sm text-foreground mb-3">{comment.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <LikeButton count={comment.likesCount} onLike={handleLike} />

        {isAuthenticated && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Répondre
          </button>
        )}

        {validReplies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {validReplies.length} réponse{validReplies.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="mt-3 ml-4 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Votre réponse..."
            rows={2}
            className="resize-none text-sm"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={isSubmitting || !replyContent.trim()}
            >
              {isSubmitting ? "..." : "Répondre"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && (
        <div className="mt-2">
          {validReplies.map((reply) => (
            <ReplyItem key={reply!._id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Post Client ──────────────────────────────────────────

export default function PostClient({
  preloadedPost,
}: {
  preloadedPost: Preloaded<typeof api.posts.posts.getPostWithMeta>;
}) {
  const post = usePreloadedQuery(preloadedPost);
  const likePost = useMutation(api.posts.likes.likePost);
  const addComment = useMutation(api.posts.comments.addComment);
  const { isAuthenticated } = useConvexAuth();

  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post)
    return <p className="text-muted-foreground p-8">Post introuvable.</p>;

  const handleLikePost = async () => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likePost({ postId: post._id });
  };

  const handleComment = async () => {
    if (!commentContent.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({ postId: post._id, content: commentContent });
      setCommentContent("");
      toast.success("Commentaire ajouté !");
    } catch {
      toast.error("Erreur lors de l'ajout du commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validComments = post.comments?.filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Post */}
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-muted-foreground mb-1">
            Posté par <span className="text-primary">u/{post.authorName}</span>{" "}
            • {getRelativeTime(post._creationTime)}
          </p>

          <h1 className="text-xl font-bold text-foreground mb-2">
            {post.title}
          </h1>

          {post.content && (
            <p className="text-sm text-foreground leading-relaxed mb-4">
              {post.content}
            </p>
          )}

          {/* Actions post */}
          <div className="flex items-center gap-4">
            <LikeButton count={post.likesCount ?? 0} onLike={handleLikePost} />

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
        </div>

        {/* Ajouter un commentaire */}
        {isAuthenticated && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Ajouter un commentaire
            </p>
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Exprimez-vous..."
              rows={3}
              className="resize-none text-sm"
            />
            <Button
              onClick={handleComment}
              disabled={isSubmitting || !commentContent.trim()}
              size="sm"
            >
              {isSubmitting ? "Envoi..." : "Commenter"}
            </Button>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            {validComments.length} commentaire
            {validComments.length > 1 ? "s" : ""}
          </h2>
          {validComments.map((comment) => (
            <CommentItem key={comment!._id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}
