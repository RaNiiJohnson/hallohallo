import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth/auth";

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
