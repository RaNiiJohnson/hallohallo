import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";

export const likePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likesCount: Math.max((post.likesCount ?? 0) - 1, 0),
      });
      return;
    }

    await ctx.db.insert("postLikes", {
      postId: args.postId,
      userId: user._id,
    });
    await ctx.db.patch(args.postId, {
      likesCount: (post.likesCount ?? 0) + 1,
    });
  },
});

export const likeComment = mutation({
  args: { commentId: v.id("postComments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("postCommentLikes")
      .withIndex("by_commentId", (q) => q.eq("commentId", args.commentId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return;
    }

    await ctx.db.insert("postCommentLikes", {
      commentId: args.commentId,
      userId: user._id,
    });
  },
});

export const likeReply = mutation({
  args: { replyId: v.id("postCommentReplies") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("postCommentReplyLikes")
      .withIndex("by_replyId", (q) => q.eq("replyId", args.replyId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return;
    }

    await ctx.db.insert("postCommentReplyLikes", {
      replyId: args.replyId,
      userId: user._id,
    });
  },
});
