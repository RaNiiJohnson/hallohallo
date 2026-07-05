import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { UserType } from "../betterAuth/users";
import { authComponent, createAuth } from "./auth";
import { UserWithRoleType } from "./users";

export const listUsers = query({
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

export const setUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("admin"),
      v.array(v.union(v.literal("user"), v.literal("admin"))),
    ),
  },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.setRole({
      body: { userId: args.userId, role: args.role },
      headers,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.removeUser({
      body: { userId: args.userId },
      headers,
    });
  },
});
