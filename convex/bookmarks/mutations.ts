// convex/bookmarks.ts
import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth/auth";
import { posthog, posthogDistinctId } from "../integrations/posthog";

export const toggleBookmark = mutation({
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
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Vérifier si le favori existe déjà
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
