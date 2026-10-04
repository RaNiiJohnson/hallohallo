import { v } from "convex/values";
import { authMutation, internalMutation } from "../functions";
import { throwForbidden, throwNotFound } from "../utils/errors";

export const markAllRead = authMutation({
  handler: async (ctx) => {
    const user = ctx.user;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false),
      )
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const markOneRead = authMutation({
  args: { notificationId: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throwNotFound("Notification not found");
    if (notification.userId !== ctx.user._id) {
      throwForbidden("Not allowed to update this notification");
    }
    await ctx.db.patch(args.notificationId, { read: true });
    return null;
  },
});

export const deleteByCommunity = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_communitySlug", (q) => q.eq("communitySlug", args.slug))
      .collect();

    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }
  },
});

export const deleteByPost = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_postSlug", (q) => q.eq("postSlug", args.slug))
      .collect();

    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }
  },
});
