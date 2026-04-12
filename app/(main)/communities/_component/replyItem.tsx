"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@convex/_generated/dataModel";
import { DeleteConfirmDialog } from "./deleteConfirmDialog";
import { LikeButton } from "./likeButton";

export function ReplyItem({
  reply,
  currentUserId,
}: {
  reply: {
    _id: Id<"postCommentReplies">;
    _creationTime: number;
    authorId?: string;
    authorName?: string;
    content: string;
    likes: { userId: string }[];
    likesCount: number;
    userHasLiked?: boolean;
  } | null;
  currentUserId?: string;
}) {
  const likeReply = useMutation(api.posts.likes.likeReply);
  const updateReply = useMutation(api.posts.comments.updateReply);
  const deleteReply = useMutation(api.posts.comments.deleteReply);
  const { isAuthenticated } = useConvexAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!reply) return null;

  const isOwner = currentUserId && reply.authorId === currentUserId;

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error("Connectez-vous pour liker");
    await likeReply({ replyId: reply._id });
  };

  const handleStartEdit = () => {
    setEditContent(reply.content);
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
      await updateReply({ replyId: reply._id, content: editContent });
      setIsEditing(false);
      toast.success("Réponse modifiée !");
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteReply({ replyId: reply._id });
      toast.success("Réponse supprimée !");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="ml-8 pl-4 border-l border-border py-2">
      <p className="text-xs text-muted-foreground mb-1">
        <span className="text-primary font-medium">{reply.authorName}</span> •{" "}
        {getRelativeTime(reply._creationTime)}
      </p>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
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
        <p className="text-sm text-foreground mb-2">{reply.content}</p>
      )}

      <div className="flex items-center gap-2">
        <LikeButton
          initialCount={reply.likesCount}
          onLike={handleLike}
          initialIsLiked={reply.userHasLiked}
        />

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
              title="Supprimer la réponse"
              description="Voulez-vous vraiment supprimer cette réponse ? Cette action est irréversible."
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
      </div>
    </div>
  );
}
