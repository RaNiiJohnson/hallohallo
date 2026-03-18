"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { getRelativeTime } from "@/lib/date";
import {
  Bookmark,
  MessageSquare,
  Share2,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useQuery } from "convex-helpers/react/cache";
import { useParams, useRouter } from "next/navigation";
import SkeletonPost from "./skeleton";
import { DeleteConfirmDialog } from "../../_component/deleteConfirmDialog";
import { LikeButton } from "../../_component/likeButton";
import { CommentItem } from "../../_component/commentItem";

export default function PostClient() {
  const { postSlug, communitySlug } = useParams();
  const router = useRouter();
  const post = useQuery(api.posts.posts.getPostWithMeta, {
    slug: postSlug as string,
  });
  const me = useQuery(api.communities.getMe);
  const likePost = useMutation(api.posts.likes.likePost);
  const addComment = useMutation(api.posts.comments.addComment);
  const updatePost = useMutation(api.posts.posts.updatePost);
  const deletePost = useMutation(api.posts.posts.deletePost);
  const { isAuthenticated } = useConvexAuth();

  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post edit state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  if (post === undefined) {
    return <SkeletonPost />;
  }

  if (post === null) {
    return <p className="text-muted-foreground p-8">Post introuvable.</p>;
  }

  const currentUserId = me?._id;
  const isPostOwner = currentUserId && post.authorId === currentUserId;

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

  const handleStartEditPost = () => {
    setEditTitle(post.title);
    setEditPostContent(post.content ?? "");
    setIsEditingPost(true);
  };

  const handleCancelEditPost = () => {
    setIsEditingPost(false);
    setEditTitle("");
    setEditPostContent("");
  };

  const handleSavePost = async () => {
    if (!editTitle.trim()) return;
    setIsSavingPost(true);
    try {
      await updatePost({
        postId: post._id,
        title: editTitle,
        content: editPostContent,
      });
      setIsEditingPost(false);
      toast.success("Post modifié !");
    } catch {
      toast.error("Erreur lors de la modification du post");
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeletingPost(true);
    try {
      await deletePost({ postId: post._id });
      toast.success("Post supprimé !");
      router.push(`/communities/${communitySlug}`);
    } catch {
      toast.error("Erreur lors de la suppression du post");
    } finally {
      setIsDeletingPost(false);
    }
  };

  const validComments = post.comments?.filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 sm:mb-4  px-4 pt-2 sm:pt-8">
        <Link
          href="/communities"
          className="hover:text-foreground transition-colors"
        >
          Communautés
        </Link>
        <span>
          <ChevronRight className="w-4 h-4" />
        </span>
        <span className="text-foreground font-medium line-clamp-1">...</span>
        <span>
          <ChevronRight className="w-4 h-4" />
        </span>
        <span className="text-foreground font-medium line-clamp-1">
          {post.title}
        </span>
      </div>
      <div className="max-w-3xl mx-auto py-2 space-y-4">
        {/* Post */}
        <article className="border-b border-border bg-background px-4 py-4">
          <p className="text-xs text-muted-foreground mb-1">
            Posté par{" "}
            <span className="text-primary hover:underline cursor-pointer">
              {post.authorName}
            </span>{" "}
            • {getRelativeTime(post._creationTime)}
          </p>

          {isEditingPost ? (
            <div className="space-y-3 mb-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-bold"
                placeholder="Titre du post"
                autoFocus
              />
              <Textarea
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                rows={5}
                className="resize-none text-sm"
                placeholder="Contenu du post..."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSavePost}
                  disabled={isSavingPost || !editTitle.trim()}
                >
                  {isSavingPost ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditPost}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-foreground mb-2">
                {post.title}
              </h1>

              {post.content && (
                <p className="text-sm text-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>
              )}
            </>
          )}

          {/* Actions post */}
          <div className="flex items-center gap-1 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="group flex items-center gap-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors h-8 px-2"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById("comments")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <MessageSquare
                size={15}
                className="transition-transform group-active:scale-95"
              />
              <span className="text-xs font-medium">
                {post.commentsCount ?? 0}
              </span>
            </Button>

            <LikeButton
              count={post.likesCount ?? 0}
              onLike={handleLikePost}
              isLiked={post.userHasLiked}
            />

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

            {/* Post edit/delete — only for author */}
            {isPostOwner && !isEditingPost && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 px-2"
                  onClick={handleStartEditPost}
                >
                  <Pencil size={15} />
                </Button>

                <DeleteConfirmDialog
                  title="Supprimer le post"
                  description="Voulez-vous vraiment supprimer ce post et tous ses commentaires ? Cette action est irréversible."
                  onConfirm={handleDeletePost}
                  isPending={isDeletingPost}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-8 px-2"
                    >
                      <Trash2 size={15} />
                    </Button>
                  }
                />
              </>
            )}
          </div>
        </article>

        {/* Ajouter un commentaire */}
        {isAuthenticated && (
          <div className="bg-background px-4 py-2 border-b border-border space-y-3">
            <p className="text-sm font-medium text-foreground">
              Ajouter un commentaire
            </p>
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Exprimez-vous..."
              rows={3}
              className="resize-none text-sm bg-transparent border-border focus-visible:ring-1"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleComment}
                disabled={isSubmitting || !commentContent.trim()}
                size="sm"
                className="rounded-full px-6"
              >
                {isSubmitting ? "Envoi..." : "Commenter"}
              </Button>
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="space-y-0 px-4 mt-4">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {validComments.length} commentaire
            {validComments.length > 1 ? "s" : ""}
          </h2>
          {validComments.map((comment) => (
            <CommentItem
              key={comment!._id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
