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

// Retourne juste les communityId qui ont des messages non lus
export const getCommunitiesWithUnread = query({
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const unreadCommunityIds: string[] = [];

    await Promise.all(
      memberships.map(async (member) => {
        const lastReadAt = member.lastReadAt ?? 0;

        const hasUnread = await ctx.db
          .query("communityMessages")
          .withIndex("by_communityId", (q) =>
            q.eq("communityId", member.communityId),
          )
          .filter((q) =>
            q.and(
              q.gt(q.field("_creationTime"), lastReadAt),
              q.neq(q.field("authorId"), user._id),
            ),
          )
          .first(); // juste vérifier s'il en existe un — pas besoin de tout charger

        if (hasUnread) {
          unreadCommunityIds.push(member.communityId);
        }
      }),
    );

    return unreadCommunityIds;
  },
});
