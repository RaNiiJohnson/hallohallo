import { v } from "convex/values";
import { authMutation } from "../functions";
import { throwNotFound, throwValidationError } from "../utils/errors";

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
  returns: v.object({ bookmarked: v.boolean() }),
  handler: async (ctx, args) => {
    const user = ctx.user;
    const normalizedResourceId =
      args.resourceType === "job"
        ? ctx.db.normalizeId("JobOffer", args.resourceId)
        : args.resourceType === "realEstate"
          ? ctx.db.normalizeId("RealestateListing", args.resourceId)
          : ctx.db.normalizeId("posts", args.resourceId);

    if (!normalizedResourceId) {
      throwValidationError("Resource type and identifier do not match");
    }
    if (!(await ctx.db.get(normalizedResourceId))) {
      throwNotFound("Bookmark resource not found");
    }

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId_and_resourceType_and_resourceId", (q) =>
        q
          .eq("userId", user._id)
          .eq("resourceType", args.resourceType)
          .eq("resourceId", normalizedResourceId),
      )
      .take(100);

    if (existing.length > 0) {
      for (const bookmark of existing) {
        await ctx.db.delete(bookmark._id);
      }
      // await posthog.capture(ctx, {
      //   distinctId: posthogDistinctId(user._id),
      //   event: "bookmark_removed",
      //   properties: {
      //     resource_id: args.resourceId,
      //     resource_type: args.resourceType,
      //   },
      // });
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      resourceId: normalizedResourceId,
      resourceType: args.resourceType,
    });
    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "bookmark_added",
    //   properties: {
    //     resource_id: args.resourceId,
    //     resource_type: args.resourceType,
    //   },
    // });
    return { bookmarked: true };
  },
});
