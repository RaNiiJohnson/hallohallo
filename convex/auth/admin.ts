import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { action, mutation, query } from "../_generated/server";
import { authComponent, createAuth } from "./auth";
import { UserWithRoleType } from "./users";
import { runCascadeDelete } from "../cascadeDeletes";

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

export const createUser = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("admin"),
      v.array(v.union(v.literal("user"), v.literal("admin"))),
    ),
  },
  handler: async (ctx, args) => {
    const { auth } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.createUser({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
        role: args.role,
        data: {
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

export const deleteUser = action({
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
