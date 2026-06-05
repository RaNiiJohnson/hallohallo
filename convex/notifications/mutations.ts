import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { authComponent } from "../auth/auth";

export const markAllRead = mutation({
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false),
      )
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const markOneRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
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
