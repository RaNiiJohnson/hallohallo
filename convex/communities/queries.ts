import { getManyFrom } from "convex-helpers/server/relationships";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import {
  communityMembersCount,
  communityPostsCount,
  postLikesCount,
} from "../aggregates";
import { authComponent } from "../auth/auth";

export const isMember = query({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    return member ?? null;
  },
});

export const getAllCommunities = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const communities = await ctx.db
      .query("communities")
      .order("desc")
      .paginate(args.paginationOpts);
    return communities;
  },
});

export const getTopCommunities = query({
  handler: async (ctx) => {
    const communities = await ctx.db.query("communities").order("desc").take(5);
    return communities;
  },
});

export const getCommunitiesPreview = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const result = await ctx.db
      .query("communities")
      .order("desc")
      .paginate(args.paginationOpts);

    const communitiesWithPreview = await Promise.all(
      result.page.map(async (community) => {
        const [membersCount, postsCount] = await Promise.all([
          communityMembersCount.count(ctx, { namespace: community._id }),
          communityPostsCount.count(ctx, { namespace: community._id }),
        ]);

        const recentPosts = await ctx.db
          .query("posts")
          .withIndex("by_communityId", (q) =>
            q.eq("communityId", community._id),
          )
          .order("desc")
          .take(3);

        const recentPostsWithLikes = await Promise.all(
          recentPosts.map(async (post) => {
            const [likesCount, userHasLiked] = await Promise.all([
              postLikesCount.count(ctx, { namespace: post._id }),
              user
                ? ctx.db
                    .query("postLikes")
                    .withIndex("by_postId", (q) => q.eq("postId", post._id))
                    .filter((q) => q.eq(q.field("userId"), user._id))
                    .first()
                    .then((l) => !!l)
                : Promise.resolve(false),
            ]);

            return { ...post, likesCount, userHasLiked };
          }),
        );

        return {
          ...community,
          recentPosts: recentPostsWithLikes,
          membersCount,
          postsCount,
        };
      }),
    );

    return {
      ...result,
      page: communitiesWithPreview,
    };
  },
});

export const getCommunity = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!community) return null;
    return community;
  },
});

export const getMyCommunities = query({
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const communities = await Promise.all(
      memberships.map((m) => ctx.db.get(m.communityId)),
    );

    return communities.filter(Boolean);
  },
});

export const getCommunityWithPosts = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const community = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!community) return null;

    const [membersCount, postsCount] = await Promise.all([
      communityMembersCount.count(ctx, { namespace: community._id }),
      communityPostsCount.count(ctx, { namespace: community._id }),
    ]);

    const posts = await getManyFrom(
      ctx.db,
      "posts",
      "by_communityId",
      community._id,
      "communityId",
    );

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, userHasLiked] = await Promise.all([
          postLikesCount.count(ctx, { namespace: post._id }),
          user
            ? ctx.db
                .query("postLikes")
                .withIndex("by_postId", (q) => q.eq("postId", post._id))
                .filter((q) => q.eq(q.field("userId"), user._id))
                .first()
                .then((l) => !!l)
            : Promise.resolve(false),
        ]);

        return { ...post, likesCount, userHasLiked };
      }),
    );

    return {
      ...community,
      membersCount,
      postsCount,
      posts: postsWithLikes,
    };
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    return user;
  },
});
