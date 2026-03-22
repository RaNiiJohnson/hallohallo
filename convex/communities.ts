import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generatedSlug } from "../src/lib/utils";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";
import { getManyFrom } from "convex-helpers/server/relationships";
import {
  communityMembersCount,
  communityPostsCount,
  postLikesCount,
} from "./aggregates";
import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";

const triggers = new Triggers<DataModel>();
triggers.register("communityMembers", communityMembersCount.trigger());
triggers.register("posts", communityPostsCount.trigger());

const mutationWithTriggers = customMutation(
  mutation,
  customCtx(triggers.wrapDB),
);

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

export const createCommunty = mutationWithTriggers({
  args: {
    name: v.string(),
    description: v.string(),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("secret"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const slug = generatedSlug(args.name);

    const comId = await ctx.db.insert("communities", {
      name: args.name,
      slug,
      description: args.description,
      authorId: user._id,
      authorName: user.name,
      privacy: args.privacy,
      searchAll: `${args.name} ${args.description} ${user.name}`,
    });

    // Ajouter le créateur comme admin
    await ctx.db.insert("communityMembers", {
      userId: user._id,
      communityId: comId,
      role: "admin",
    });

    return { comId, slug };
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

export const updateCommunity = mutationWithTriggers({
  args: {
    id: v.id("communities"),
    name: v.string(),
    description: v.string(),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("secret"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Community not found");
    if (community.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      privacy: args.privacy,
      searchAll: `${args.name} ${args.description} ${user.name}`,
    });
  },
});

export const deleteCommunity = mutationWithTriggers({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Community not found");
    if (community.authorId !== user._id) throw new Error("Not authorized");

    // 1. Tous les posts de la communauté
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();

    for (const post of posts) {
      const postLikes = await ctx.db
        .query("postLikes")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .collect();
      for (const like of postLikes) await ctx.db.delete(like._id);

      const comments = await ctx.db
        .query("postComments")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
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

      await ctx.db.delete(post._id);
    }

    // 2. Members
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();
    for (const member of members) await ctx.db.delete(member._id);

    // 3. Messages
    const messages = await ctx.db
      .query("communityMessages")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();
    for (const message of messages) await ctx.db.delete(message._id);

    // 4. Communauté
    await ctx.db.delete(args.id);
  },
});

export const joinCommunity = mutationWithTriggers({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    const existing = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (existing) throw new Error("Already a member");

    await ctx.db.insert("communityMembers", {
      userId: user._id,
      communityId: args.communityId,
      role: "member",
    });
  },
});

export const leaveCommunity = mutationWithTriggers({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) throw new Error("Not a member");
    if (member.role === "admin")
      throw new Error("Admin cannot leave — delete the community instead");

    await ctx.db.delete(member._id);
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;
    return user;
  },
});
