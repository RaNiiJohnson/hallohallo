import { v } from "convex/values";
import { authMutation } from "../functions";
import { posthog, posthogDistinctId } from "../integrations/posthog";
import { throwForbidden, throwNotFound } from "../utils/errors";

export const sendMessage = authMutation({
  args: {
    communityId: v.id("communities"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) throw new Error("Not a member");

    await ctx.db.insert("communityMessages", {
      communityId: args.communityId,
      authorId: user._id,
      authorName: user.name,
      content: args.content,
    });

    // Update lastReadAt for the sender only
    await ctx.db.patch(member._id, {
      lastReadAt: Date.now(),
    });

    await posthog.capture(ctx, {
      distinctId: posthogDistinctId(user._id),
      event: "chat_message_sent",
      properties: { community_id: args.communityId },
      groups: { community: args.communityId },
    });
  },
});

export const editMessage = authMutation({
  args: {
    id: v.id("communityMessages"),
    communityId: v.id("communities"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) throw new Error("Not a member");

    const message = await ctx.db.get(args.id);
    if (!message) throw new Error("Message not found");

    if (message.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.id, {
      content: args.content,
      editedAt: Date.now(),
    });
  },
});

export const deleteMessage = authMutation({
  args: {
    id: v.id("communityMessages"),
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) throwForbidden("Not a member");

    const message = await ctx.db.get(args.id);
    if (!message) throwNotFound("Message not found");

    if (message.authorId !== user._id) throwForbidden("Not authorized");

    await ctx.db.delete(args.id);
  },
});

export const markAsRead = authMutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const user = ctx.user;
    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) return;
    await ctx.db.patch(member._id, { lastReadAt: Date.now() });
  },
});
