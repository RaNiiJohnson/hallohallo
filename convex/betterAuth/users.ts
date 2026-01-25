import { query } from "./_generated/server";
import { v } from "convex/values";
import schema from "./schema";
import { doc } from "convex-helpers/validators";

export const getUserBySlug = query({
  args: { slug: v.string() },
  // important: `returns` for type visibility
  returns: v.union(v.null(), doc(schema, "user")),
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("user")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});
