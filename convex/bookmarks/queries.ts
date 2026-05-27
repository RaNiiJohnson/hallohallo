// convex/bookmarks.ts
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { authComponent } from "../auth/auth";

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
