import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const commentId = await ctx.db.insert("postComments", {
      postId: args.postId,
      authorId: user._id,
      content: args.content,
      authorName: user.name,
    });

    // Incrémenter commentsCount sur le post
    await ctx.db.patch(args.postId, {
      commentsCount: (post.commentsCount ?? 0) + 1,
    });

    return commentId;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("postComments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== user._id) throw new Error("Not authorized");

    const post = await ctx.db.get(comment.postId);

    // 1. Likes du commentaire
    const commentLikes = await ctx.db
      .query("postCommentLikes")
      .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
      .collect();
    for (const like of commentLikes) await ctx.db.delete(like._id);

    // 2. Replies
    const replies = await ctx.db
      .query("postCommentReplies")
      .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
      .collect();

    for (const reply of replies) {
      const replyLikes = await ctx.db
        .query("postCommentReplyLikes")
        .withIndex("by_replyId", (q) => q.eq("replyId", reply._id))
        .collect();
      for (const like of replyLikes) await ctx.db.delete(like._id);
      await ctx.db.delete(reply._id);
    }

    // 3. Commentaire lui-même
    await ctx.db.delete(args.commentId);

    // 4. Décrémenter commentsCount sur le post
    if (post) {
      await ctx.db.patch(comment.postId, {
        commentsCount: Math.max((post.commentsCount ?? 0) - 1, 0),
      });
    }
  },
});

export const updateComment = mutation({
  args: {
    commentId: v.id("postComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.commentId, { content: args.content });
  },
});

export const addReply = mutation({
  args: {
    commentId: v.id("postComments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const replyId = await ctx.db.insert("postCommentReplies", {
      commentId: args.commentId,
      authorId: user._id,
      authorName: user.name,
      content: args.content,
    });

    return replyId;
  },
});

export const updateReply = mutation({
  args: {
    replyId: v.id("postCommentReplies"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");
    if (reply.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.replyId, { content: args.content });
  },
});

export const deleteReply = mutation({
  args: { replyId: v.id("postCommentReplies") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");
    if (reply.authorId !== user._id) throw new Error("Not authorized");

    // 1. Likes de la reply
    const replyLikes = await ctx.db
      .query("postCommentReplyLikes")
      .withIndex("by_replyId", (q) => q.eq("replyId", args.replyId))
      .collect();
    for (const like of replyLikes) await ctx.db.delete(like._id);

    // 2. Reply elle-même
    await ctx.db.delete(args.replyId);
  },
});
