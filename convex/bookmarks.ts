// convex/bookmarks.ts
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// convex/bookmarks.ts
export const getMyBookmarks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return Promise.all(
      bookmarks.map(async (b) => {
        // On choisit la table selon le type stocké
        const details =
          b.resourceType === "job"
            ? await ctx.db.get(b.resourceId as Id<"JobOffer">)
            : await ctx.db.get(b.resourceId as Id<"RealestateListing">);

        return { ...b, details };
      }),
    );
  },
});

export const toggleBookmark = mutation({
  args: {
    resourceId: v.union(v.id("JobOffer"), v.id("RealestateListing")),
    resourceType: v.union(v.literal("job"), v.literal("realEstate")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Vérifier si le favori existe déjà
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_resource", (q) =>
        q.eq("userId", args.userId).eq("resourceId", args.resourceId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", {
      userId: args.userId,
      resourceId: args.resourceId,
      resourceType: args.resourceType,
    });
    return { bookmarked: true };
  },
});
