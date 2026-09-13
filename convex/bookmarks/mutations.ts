import { v } from "convex/values";
import { authMutation } from "../functions";
import { posthog, posthogDistinctId } from "../integrations/posthog";

export const toggleBookmark = authMutation({
  args: {
    resourceId: v.union(
      v.id("JobOffer"),
      v.id("RealestateListing"),
      v.id("posts"),
    ),
    resourceType: v.union(
      v.literal("job"),
      v.literal("realEstate"),
      v.literal("post"),
    ),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    // Verify if the bookmark already exists
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_resource", (q) =>
        q.eq("userId", user._id).eq("resourceId", args.resourceId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      await posthog.capture(ctx, {
        distinctId: posthogDistinctId(user._id),
        event: "bookmark_removed",
        properties: {
          resource_id: args.resourceId,
          resource_type: args.resourceType,
        },
      });
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      resourceId: args.resourceId,
      resourceType: args.resourceType,
    });
    await posthog.capture(ctx, {
      distinctId: posthogDistinctId(user._id),
      event: "bookmark_added",
      properties: {
        resource_id: args.resourceId,
        resource_type: args.resourceType,
      },
    });
    return { bookmarked: true };
  },
});
