import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { authMutation } from "../functions";

export const createCommunity = authMutation({
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
    const { user } = ctx;

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

    // const distinctId = posthogDistinctId(user._id);
    // await posthog.groupIdentify(ctx, {
    //   groupType: "community",
    //   groupKey: comId,
    //   properties: { name: args.name, privacy: args.privacy, slug },
    //   distinctId,
    // });
    // await posthog.capture(ctx, {
    //   distinctId,
    //   event: "community_created",
    //   properties: {
    //     community_id: comId,
    //     slug,
    //     privacy: args.privacy,
    //   },
    //   groups: { community: comId },
    // });

    return { comId, slug };
  },
});

export const updateCommunity = authMutation({
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
    const { user } = ctx;

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

export const joinCommunity = authMutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const { user } = ctx;

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

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "community_joined",
    //   properties: {
    //     community_id: args.communityId,
    //     community_slug: community.slug,
    //     privacy: community.privacy,
    //   },
    //   groups: { community: args.communityId },
    // });

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

export const leaveCommunity = authMutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const { user } = ctx;

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

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "community_left",
    //   properties: {
    //     community_id: args.communityId,
    //     community_slug: community.slug,
    //   },
    //   groups: { community: args.communityId },
    // });

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
