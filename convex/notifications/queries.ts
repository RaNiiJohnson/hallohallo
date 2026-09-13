import { authQuery } from "../functions";

export const getMyNotifications = authQuery({
  handler: async (ctx) => {
    const user = ctx.user;
    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const getUnreadCount = authQuery({
  handler: async (ctx) => {
    const user = ctx.user;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_read", (q) =>
        q.eq("userId", user._id).eq("read", false),
      )
      .collect();

    return unread.length;
  },
});
