import { partial } from "convex-helpers/validators";
import { ConvexError, v } from "convex/values";
import { components } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { UserType, userValidator } from "../betterAuth/users";
import { authComponent, createAuth } from "./auth";

export const getUserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    // 1. Récupérer l'utilisateur via le composant
    const user: UserType = await ctx.runQuery(
      components.betterAuth.users.getUserBySlug,
      {
        slug,
      },
    );

    if (!user) return null;

    return {
      ...user,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // 1. Récupérer les users via la query du composant betterAuth
    const users: UserType[] = await ctx.runQuery(
      components.betterAuth.users.getAllUsers,
      {},
    );

    const currentUser = await authComponent.safeGetAuthUser(ctx);

    const filtered = currentUser
      ? users.filter((u) => u._id !== currentUser._id)
      : users;

    // 2. Résoudre les URLs d’images dans ce contexte
    return filtered;
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    patch: partial(userValidator.omit("updatedAt")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

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

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const result = await auth.api.listUsers({
      query: { limit: 50 },
      headers,
    });
    return result.users;
  },
});

export const banUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.banUser({
      body: { userId: args.userId, banReason: "Non respect" },
      headers,
    });
  },
});

export const unbanUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.unbanUser({
      body: { userId: args.userId },
      headers,
    });
  },
});
