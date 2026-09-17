import { partial } from "convex-helpers/validators";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { UserType, userValidator } from "../betterAuth/users";
import { authMutation, query } from "../functions";
import { authComponent } from "./auth";

const editableUserFields = userValidator.pick(
  "name",
  "image",
  "coverImage",
  "slug",
  "headline",
  "bio",
  "city",
  "country",
  "industry",
  "roles",
  "company",
  "field",
  "skills",
  "experienceYears",
  "arrivalDate",
  "journey",
  "status",
  "isServiceProvider",
  "isPublic",
  "showEmail",
  "showPhone",
  "cv",
  "userType",
);

export type UserWithRoleType = UserType & {
  id: string;
  role?: string | undefined;
  banned: boolean | null;
  banReason?: (string | null) | undefined;
  banExpires?: (number | null) | undefined;
};

export const getUserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
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

export const getUserById = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const user: UserType = await ctx.runQuery(
      components.betterAuth.users.getUserById,
      {
        id,
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
    const users: UserType[] = await ctx.runQuery(
      components.betterAuth.users.getAllUsers,
      {},
    );

    const currentUser = await authComponent.safeGetAuthUser(ctx);

    const filtered = currentUser
      ? users.filter((u) => u._id !== currentUser._id)
      : users;

    // Resolve image URLs in this context
    return filtered;
  },
});

export const updateUser = authMutation({
  args: {
    patch: partial(editableUserFields),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;
    await ctx.runMutation(components.betterAuth.users.updateUser, {
      id: user._id,
      patch: args.patch,
    });

    // const distinctId = posthogDistinctId(user._id);
    // await posthog.identify(ctx, {
    //   distinctId,
    //   properties: {
    //     email: user.email,
    //     name: args.patch.name ?? user.name,
    //     role: args.patch.userType ?? user.userType,
    //   },
    // });

    // if (args.patch.userType) {
    //   await posthog.capture(ctx, {
    //     distinctId,
    //     event: "user_role_selected",
    //     properties: { role: args.patch.userType },
    //   });
    // }
  },
});
