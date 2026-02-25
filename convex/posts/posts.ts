import { getManyFrom } from "convex-helpers/server/relationships";
import { generatedSlug } from "../../src/lib/utils";
import { DatabaseReader, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { Id } from "../_generated/dataModel";

type AuthUser = Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>;

// ─── Helpers réutilisables ───────────────────────────────

async function getReplyWithLikes(
  db: DatabaseReader,
  replyId: Id<"postCommentReplies">,
  user: AuthUser,
) {
  const reply = await db.get(replyId);
  if (!reply) return null;
  const likes = await getManyFrom(
    db,
    "postCommentReplyLikes",
    "by_replyId",
    replyId,
    "replyId",
  );

  let userHasLiked = false;
  if (user) {
    const existingLike = await db
      .query("postCommentReplyLikes")
      .withIndex("by_replyId", (q) => q.eq("replyId", replyId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    if (existingLike) userHasLiked = true;
  }

  return { ...reply, likes, likesCount: likes.length, userHasLiked };
}

async function getCommentWithMeta(
  db: DatabaseReader,
  commentId: Id<"postComments">,
  user: AuthUser,
) {
  const comment = await db.get(commentId);
  if (!comment) return null;

  const [commentLikes, replies] = await Promise.all([
    getManyFrom(db, "postCommentLikes", "by_commentId", commentId, "commentId"),
    getManyFrom(
      db,
      "postCommentReplies",
      "by_commentId",
      commentId,
      "commentId",
    ),
  ]);

  const repliesWithLikes = await Promise.all(
    replies.map((r) => getReplyWithLikes(db, r._id, user)),
  );

  let userHasLiked = false;
  if (user) {
    const existingLike = await db
      .query("postCommentLikes")
      .withIndex("by_commentId", (q) => q.eq("commentId", commentId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();
    if (existingLike) userHasLiked = true;
  }

  return {
    ...comment,
    likes: commentLikes,
    likesCount: commentLikes.length,
    userHasLiked,
    replies: repliesWithLikes,
  };
}

// ─── Queries ─────────────────────────────────────────────

export const getPostWithMeta = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) return null;

    const [likes, comments] = await Promise.all([
      getManyFrom(ctx.db, "postLikes", "by_postId", post._id, "postId"),
      getManyFrom(ctx.db, "postComments", "by_postId", post._id, "postId"),
    ]);

    const commentsWithMeta = await Promise.all(
      comments.map((c) => getCommentWithMeta(ctx.db, c._id, user)),
    );

    let userHasLiked = false;
    if (user) {
      const existingLike = await ctx.db
        .query("postLikes")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();
      if (existingLike) userHasLiked = true;
    }

    return {
      ...post,
      likes,
      likesCount: likes.length,
      userHasLiked,
      comments: commentsWithMeta,
      commentsCount: comments.length,
    };
  },
});

export const createPost = mutation({
  args: {
    content: v.string(),
    title: v.string(),
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    const postId = await ctx.db.insert("posts", {
      slug: generatedSlug(args.title),
      authorId: user._id,
      content: args.content,
      title: args.title,
      authorName: user.name,
      communityId: args.communityId,
      searchAll: `${args.title} ${args.content} ${user.name}`,
      likesCount: 0,
      commentsCount: 0,
    });

    // Incrémenter postsCount sur la communauté
    await ctx.db.patch(args.communityId, {
      postsCount: (community.postsCount ?? 0) + 1,
    });

    return postId;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");

    const community = await ctx.db.get(post.communityId);

    // 1. Likes du post
    const postLikes = await ctx.db
      .query("postLikes")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();
    for (const like of postLikes) await ctx.db.delete(like._id);

    // 2. Commentaires
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_postId", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      const commentLikes = await ctx.db
        .query("postCommentLikes")
        .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
        .collect();
      for (const like of commentLikes) await ctx.db.delete(like._id);

      const replies = await ctx.db
        .query("postCommentReplies")
        .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
        .collect();

      for (const reply of replies) {
        const replyLikes = await ctx.db
          .query("postCommentReplyLikes")
          .withIndex("by_replyId", (q) => q.eq("replyId", reply._id))
          .collect();
        for (const like of replyLikes) await ctx.db.delete(like._id);
        await ctx.db.delete(reply._id);
      }

      await ctx.db.delete(comment._id);
    }

    // 3. Post lui-même
    await ctx.db.delete(args.postId);

    // 4. Décrémenter postsCount sur la communauté
    if (community) {
      await ctx.db.patch(post.communityId, {
        postsCount: Math.max((community.postsCount ?? 0) - 1, 0),
      });
    }
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.postId, {
      content: args.content,
      title: args.title,
      searchAll: `${args.title} ${args.content} ${user.name}`,
    });
  },
});
