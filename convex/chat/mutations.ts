import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth/auth";

export const sendMessage = mutation({
  args: {
    communityId: v.id("communities"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

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

    // Mettre à jour lastReadAt de l'expéditeur seulement
    await ctx.db.patch(member._id, {
      lastReadAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { communityId: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return;

    const member = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("communityId"), args.communityId))
      .first();

    if (!member) return;
    await ctx.db.patch(member._id, { lastReadAt: Date.now() });
  },
});
