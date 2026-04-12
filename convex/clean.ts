import { mutation } from "./_generated/server";

export const cleanBookmarks = mutation({
  args: {},
  handler: async (ctx) => {
    const invalidBookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", ""))
      .collect();

    for (const b of invalidBookmarks) {
      await ctx.db.delete(b._id);
    }

    return invalidBookmarks.length;
  },
});
