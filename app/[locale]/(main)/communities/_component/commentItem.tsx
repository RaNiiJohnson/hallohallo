"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@convex/_generated/dataModel";
import { DeleteConfirmDialog } from "./deleteConfirmDialog";
import { LikeButton } from "./likeButton";
import { ReplyItem } from "./replyItem";

export function CommentItem({
  comment,
  currentUserId,
}: {
  comment: {
    _id: Id<"postComments">;
    _creationTime: number;
    authorId?: string;
    authorName?: string;
    content: string;
    likes: { userId: string }[];
    likesCount: number;
    userHasLiked?: boolean;
    replies: ({
      _id: Id<"postCommentReplies">;
      _creationTime: number;
      authorId?: string;
      authorName?: string;
      content: string;
      likes: { userId: string }[];
      likesCount: number;
      userHasLiked?: boolean;
    } | null)[];
  } | null;
  currentUserId?: string;
}) {
  const likeComment = useMutation(api.posts.likes.likeComment);
  const addReply = useMutation(api.posts.comments.addReply);
  const updateComment = useMutation(api.posts.comments.updateComment);
  const deleteComment = useMutation(api.posts.comments.deleteComment);
  const { isAuthenticated } = useConvexAuth();

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!comment) return null;

  const isOwner = currentUserId && comment.authorId === currentUserId;

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

  const handleStartEdit = () => {
    setEditContent(comment.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      await updateComment({ commentId: comment._id, content: editContent });
      setIsEditing(false);
      toast.success("Commentaire modifié !");
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteComment({ commentId: comment._id });
      toast.success("Commentaire supprimé !");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const validReplies = comment.replies.filter(Boolean);

  return (
    <div className="border-b border-border py-4">
      {/* Author */}
      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
        <span className="text-primary font-bold hover:underline cursor-pointer">
          {comment.authorName}
        </span>{" "}
        • <span>{getRelativeTime(comment._creationTime)}</span>
      </p>

      {/* Content / Edit mode */}
      {isEditing ? (
        <div className="space-y-2 mb-3">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="resize-none text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSaving || !editContent.trim()}
            >
              {isSaving ? "..." : "Enregistrer"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground mb-3">{comment.content}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <LikeButton
          initialCount={comment.likesCount}
          initialIsLiked={comment.userHasLiked}
          onLike={handleLike}
        />

        {isAuthenticated && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Répondre
          </button>
        )}

        {isOwner && !isEditing && (
          <>
            <button
              onClick={handleStartEdit}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Pencil size={12} />
              Modifier
            </button>

            <DeleteConfirmDialog
              title="Supprimer le commentaire"
              description="Voulez-vous vraiment supprimer ce commentaire et toutes ses réponses ? Cette action est irréversible."
              onConfirm={handleDelete}
              isPending={isDeleting}
              trigger={
                <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
                  <Trash2 size={12} />
                  Supprimer
                </button>
              }
            />
          </>
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
            <ReplyItem
              key={reply!._id}
              reply={reply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
