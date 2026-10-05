import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { v } from "convex/values";
import schema from "../schema";
import { authQuery, query } from "../functions";
import { authComponent } from "../auth/auth";
import { throwForbidden, throwNotFound } from "../utils/errors";

export const getMessages = authQuery({
  args: {
    communityId: v.id("communities"),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(schema.doc("communityMessages")),
  handler: async (ctx, args) => {
    const community = await ctx.db.get(args.communityId);
    if (!community) throwNotFound("Community not found");

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId_communityId", (q) =>
        q.eq("userId", ctx.user._id).eq("communityId", args.communityId),
      )
      .unique();
    if (!membership) {
      throwForbidden("Community membership required");
    }

    return await ctx.db
      .query("communityMessages")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.communityId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Return just the communityIds that have unread messages
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
          .first(); // Check if there are unread messages

        if (hasUnread) {
          unreadCommunityIds.push(member.communityId);
        }
      }),
    );

    return unreadCommunityIds;
  },
});
