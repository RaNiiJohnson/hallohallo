import { authQuery } from "../functions";

export const getMyBookmarks = authQuery({
  args: {},
  handler: async (ctx) => {
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", ctx.user._id))
      .order("desc")
      .take(100);

    return Promise.all(
      bookmarks.map(async (b) => {
        const resourceId =
          b.resourceType === "job"
            ? ctx.db.normalizeId("JobOffer", b.resourceId)
            : b.resourceType === "realEstate"
              ? ctx.db.normalizeId("RealestateListing", b.resourceId)
              : ctx.db.normalizeId("posts", b.resourceId);
        const details = resourceId ? await ctx.db.get(resourceId) : null;

        return { ...b, details };
      }),
    );
  },
});
