import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { postLikesCount } from "../aggregates";

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
      await postLikesCount.delete(ctx, existing);
      await ctx.db.delete(existing._id);
      return;
    }

    const likeId = await ctx.db.insert("postLikes", {
      postId: args.postId,
      userId: user._id,
    });
    const likeDoc = (await ctx.db.get(likeId))!;
    await postLikesCount.insert(ctx, likeDoc);

    // Notification
    if (post.authorId !== user._id) {
      const community = await ctx.db.get(post.communityId);
      await ctx.db.insert("notifications", {
        userId: post.authorId,
        type: "new_like",
        read: false,
        fromUserName: user.name,
        postSlug: post.slug,
        communitySlug: community?.slug,
        message: `${user.name} a checké votre post "${post.title}"`,
      });
    }
  },
});

export const likeComment = mutation({
  args: { commentId: v.id("postComments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

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

    // Notification
    if (comment.authorId !== user._id) {
      const post = await ctx.db.get(comment.postId);
      const community = post ? await ctx.db.get(post.communityId) : null;
      await ctx.db.insert("notifications", {
        userId: comment.authorId,
        type: "new_comment_like",
        read: false,
        fromUserName: user.name,
        postSlug: post?.slug,
        communitySlug: community?.slug,
        message: `${user.name} a checké votre commentaire`,
      });
    }
  },
});

export const likeReply = mutation({
  args: { replyId: v.id("postCommentReplies") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");

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

    // Notification
    if (reply.authorId !== user._id) {
      const comment = await ctx.db.get(reply.commentId);
      const post = comment ? await ctx.db.get(comment.postId) : null;
      const community = post ? await ctx.db.get(post.communityId) : null;
      await ctx.db.insert("notifications", {
        userId: reply.authorId,
        type: "new_reply_like",
        read: false,
        fromUserName: user.name,
        postSlug: post?.slug,
        communitySlug: community?.slug,
        message: `${user.name} a checké votre réponse`,
      });
    }
  },
});
