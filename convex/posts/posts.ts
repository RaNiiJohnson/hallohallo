import { getManyFrom } from "convex-helpers/server/relationships";
import { generatedSlug } from "../../src/lib/utils";
import { DatabaseReader, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth";
import { components } from "../_generated/api";
import { DataModel, Id } from "../_generated/dataModel";
import {
  communityPostsCount,
  postCommentsCount,
  postLikesCount,
  postShuffle,
} from "../aggregates";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import Rand from "rand-seed";

type AuthUser = Awaited<ReturnType<typeof authComponent.safeGetAuthUser>>;

// ─── Triggers

const triggers = new Triggers<DataModel>();
triggers.register("posts", communityPostsCount.trigger());
triggers.register("postComments", postCommentsCount.trigger());
triggers.register("postLikes", postLikesCount.trigger());

const mutationWithTriggers = customMutation(
  mutation,
  customCtx(triggers.wrapDB),
);

// ─── Helpers réutilisables

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

// ─── Queries

export const getPostWithMeta = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!post) return null;

    const [likesCount, commentsCount, comments] = await Promise.all([
      postLikesCount.count(ctx, { namespace: post._id }),
      postCommentsCount.count(ctx, { namespace: post._id }),
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
      likesCount,
      userHasLiked,
      comments: commentsWithMeta,
      commentsCount,
    };
  },
});

export const getShuffledPosts = query({
  args: {
    seed: v.string(), // fixe pour toute la session → même ordre
    offset: v.number(), // 0, 10, 20, ...
    numItems: v.number(), // 10 par page
  },
  handler: async (ctx, { seed, offset, numItems }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const count = await postShuffle.count(ctx);

    if (count === 0) return { posts: [], hasMore: false, totalCount: 0 };

    // Génère l'ordre shufflé une fois avec le seed
    const rand = new Rand(seed);
    const allIndexes = Array.from({ length: count }, (_, i) => i);
    shuffle(allIndexes, rand);

    const pageIndexes = allIndexes.slice(offset, offset + numItems);

    const atIndexes = await Promise.all(
      pageIndexes.map((i) => postShuffle.at(ctx, i)),
    );

    const posts = await Promise.all(
      atIndexes.map(async ({ id }) => {
        const post = await ctx.db.get(id);
        if (!post) return null;

        const [likesCount, commentsCount] = await Promise.all([
          postLikesCount.count(ctx, { namespace: post._id }),
          postCommentsCount.count(ctx, { namespace: post._id }),
        ]);

        let userHasLiked = false;
        if (user) {
          const existingLike = await ctx.db
            .query("postLikes")
            .withIndex("by_postId", (q) => q.eq("postId", post._id))
            .filter((q) => q.eq(q.field("userId"), user._id))
            .first();
          if (existingLike) userHasLiked = true;
        }

        const author = await ctx.runQuery(
          components.betterAuth.users.getUserById,
          { id: post.authorId },
        );
        let authorData = null;
        if (author) {
          const imageUrl = author.image
            ? await ctx.storage.getUrl(author.image)
            : null;
          authorData = { ...author, imageUrl };
        }

        return {
          ...post,
          likesCount,
          commentsCount,
          userHasLiked,
          author: authorData,
        };
      }),
    );

    return {
      posts: posts.filter(
        (post): post is NonNullable<typeof post> => post !== null,
      ),
      hasMore: offset + numItems < count,
      hasPrevPage: offset > 0,
      totalCount: count,
    };
  },
});

// Fisher-Yates
function shuffle<T>(array: T[], rand: Rand): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rand.next() * (i + 1));
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

export const createPost = mutationWithTriggers({
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
      communityName: community.name,
      communitySlug: community.slug,
      searchAll: `${args.title} ${args.content} ${user.name} ${community.name}`,
    });

    const postDoc = (await ctx.db.get(postId))!;
    await postShuffle.insert(ctx, postDoc);

    return postId;
  },
});

export const deletePost = mutationWithTriggers({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");

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

    // 3. Delete postShuffle
    await postShuffle.delete(ctx, post);

    // 4. Aggregate + delete du post
    await ctx.db.delete(args.postId);
  },
});

export const updatePost = mutationWithTriggers({
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
