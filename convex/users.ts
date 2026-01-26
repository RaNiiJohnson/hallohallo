import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { partial } from "convex-helpers/validators";
import { userValidator } from "./betterAuth/users";

export const getUserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.runQuery(components.betterAuth.users.getUserBySlug, {
      slug,
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("user"),
    patch: partial(userValidator.omit("createdAt", "updatedAt")),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(components.betterAuth.users.updateUser, args);
  },
});

// const updateUser = useMutation(api.users.updateUser);
// await updateUser({
//   id: userId,
//   patch: { city: "Paris", headline: "Dev JS" },
// });

export const updateUserPassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.changePassword({
      body: {
        currentPassword: args.currentPassword,
        newPassword: args.newPassword,
      },
      headers,
    });
  },
});
