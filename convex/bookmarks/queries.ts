import { Id } from "../_generated/dataModel";
import { authQuery } from "../functions";

export const getMyBookmarks = authQuery({
  args: {},
  handler: async (ctx) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
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
