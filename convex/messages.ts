import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";

export const sendMessage = mutation({
  args: {
    communityId: v.id("communities"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Vérifier que l'user est membre
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
  },
});

export const getMessages = query({
  args: {
    communityId: v.id("communities"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityMessages")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.communityId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
