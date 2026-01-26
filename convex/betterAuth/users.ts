import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import schema from "./schema";
import { doc, partial } from "convex-helpers/validators";

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

export const userValidator = schema.tables.user.validator;

export const updateUser = mutation({
  args: {
    id: v.id("user"),
    patch: partial(userValidator),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch);
  },
});
