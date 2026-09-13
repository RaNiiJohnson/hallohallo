import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { components } from "../_generated/api";
import { runCascadeDelete } from "../cascadeDeletes";
import { adminAction, adminMutation, adminQuery } from "../functions";
import { authComponent, createAuth } from "./auth";
import { UserWithRoleType } from "./users";

export const listUsers = adminQuery({
  args: {},
  handler: async (ctx) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const result = await auth.api.listUsers({
      query: { limit: 50 },
      headers,
    });
    return result.users as unknown as UserWithRoleType[];
  },
});

export const banUser = adminMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.banUser({
      body: { userId: args.userId, banReason: "Non respect" },
      headers,
    });
  },
});

export const unbanUser = adminMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.unbanUser({
      body: { userId: args.userId },
      headers,
    });
  },
});

export const setUserRole = adminMutation({
  args: {
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(components.betterAuth.users.updateUser, {
      id: args.userId,
      patch: {
        role: args.role,
      },
    });
  },
});

export const setUserType = adminMutation({
  args: {
    userId: v.string(),
    userType: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(components.betterAuth.users.updateUser, {
      id: args.userId,
      patch: {
        userType: args.userType,
      },
    });
  },
});

export const createUser = adminMutation({
  args: {
    userId: v.string(),
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const { auth } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.createUser({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
        data: {
          role: args.role,
          slug: generatedSlug(args.name),
          emailVerified: true,
          isPublic: true,
          showEmail: true,
          showPhone: true,
        },
      },
    });
  },
});

export const deleteUser = adminAction({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.removeUser({
      body: { userId: args.userId },
      headers,
    });

    const counts = await runCascadeDelete(ctx, "user", args.userId);
    return counts;
  },
});
