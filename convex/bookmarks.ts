// convex/bookmarks.ts
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getMyBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return Promise.all(
      bookmarks.map(async (b) => {
        const details =
          b.resourceType === "job"
            ? await ctx.db.get(b.resourceId as Id<"JobOffer">)
            : b.resourceType === "realEstate"
            ? await ctx.db.get(b.resourceId as Id<"RealestateListing">)
            : await ctx.db.get(b.resourceId as Id<"posts">);

        return { ...b, details };
      }),
    );
  },
});

export const toggleBookmark = mutation({
  args: {
    resourceId: v.union(v.id("JobOffer"), v.id("RealestateListing"), v.id("posts")),
    resourceType: v.union(v.literal("job"), v.literal("realEstate"), v.literal("post")),
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
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: user._id,
      resourceId: args.resourceId,
      resourceType: args.resourceType,
    });
    return { bookmarked: true };
  },
});
