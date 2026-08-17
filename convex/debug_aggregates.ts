import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import {
  communityMembersCount,
  communityPostsCount,
  postCommentsCount,
  postLikesCount,
  postShuffle,
  postSortedByDate,
  postSortedByLikes,
} from "./aggregates";

/**
 * Diagnostic query: compare real post count vs aggregate counts.
 */
export const checkSync = query({
  args: {},
  handler: async (ctx) => {
    const allPosts = await ctx.db.query("posts").collect();
    const realCount = allPosts.length;

    const shuffleCount = await postShuffle.count(ctx);
    const dateCount = await postSortedByDate.count(ctx);
    const likesCount = await postSortedByLikes.count(ctx);

    return {
      realPostCount: realCount,
      aggregates: { shuffle: shuffleCount, date: dateCount, likes: likesCount },
      inSync:
        realCount === shuffleCount &&
        realCount === dateCount &&
        realCount === likesCount,
    };
  },
});

/**
 * Nuclear clear + rebuild of all aggregates.
 */
export const rebuildAllAggregates = internalMutation({
  args: {},
  handler: async (ctx) => {
    await postShuffle.clear(ctx);
    await postSortedByDate.clear(ctx);
    await postSortedByLikes.clear(ctx);

    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await postLikesCount.clear(ctx, { namespace: post._id });
      await postCommentsCount.clear(ctx, { namespace: post._id });
    }

    const communities = await ctx.db.query("communities").collect();
    for (const community of communities) {
      await communityPostsCount.clear(ctx, { namespace: community._id });
      await communityMembersCount.clear(ctx, { namespace: community._id });
    }

    for (const post of posts) {
      await postShuffle.insert(ctx, post);
      await postSortedByDate.insert(ctx, post);
      await postSortedByLikes.insert(ctx, post);
      await communityPostsCount.insert(ctx, post);
    }

    const postLikes = await ctx.db.query("postLikes").collect();
    for (const like of postLikes) {
      await postLikesCount.insert(ctx, like);
    }

    const postComments = await ctx.db.query("postComments").collect();
    for (const comment of postComments) {
      await postCommentsCount.insert(ctx, comment);
    }

    const communityMembers = await ctx.db.query("communityMembers").collect();
    for (const member of communityMembers) {
      await communityMembersCount.insert(ctx, member);
    }

    return {
      rebuilt: {
        posts: posts.length,
        postLikes: postLikes.length,
        postComments: postComments.length,
        communities: communities.length,
        communityMembers: communityMembers.length,
      },
    };
  },
});
