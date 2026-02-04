import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import schema from "./schema";
import { partial } from "convex-helpers/validators";
import { Doc } from "./_generated/dataModel";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("user").collect();
    return users;
  },
});

export const getUserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const user = await ctx.db
      .query("user")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    return user;
  },
});

export const userValidator = schema.tables.user.validator;

export type User = Doc<"user">;

export const updateUser = mutation({
  args: {
    id: v.id("user"),
    patch: partial(userValidator),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch);
  },
});
