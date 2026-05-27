import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { DataModel } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import { communityMembersCount, communityPostsCount } from "../aggregates";
import { authComponent } from "../auth/auth";

const triggers = new Triggers<DataModel>();
triggers.register("communityMembers", communityMembersCount.trigger());
triggers.register("posts", communityPostsCount.trigger());

const mutationWithTriggers = customMutation(
  mutation,
  customCtx(triggers.wrapDB),
);

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

    //notifcation
    if (community.authorId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: community.authorId,
        type: "new_member",
        read: false,
        fromUserName: user.name,
        communitySlug: community.slug,
        message: `${user.name} a rejoint votre communauté "${community.name}"`,
      });
    }
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

    //notifcation
    if (community.authorId !== user._id) {
      await ctx.db.insert("notifications", {
        userId: community.authorId,
        type: "leave_community",
        read: false,
        fromUserName: user.name,
        communitySlug: community.slug,
        message: `${user.name} a quitté votre communauté "${community.name}"`,
      });
    }
  },
});
