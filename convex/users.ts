import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { partial } from "convex-helpers/validators";
import { User, userValidator } from "./betterAuth/users";

export type UserWithUrls = Omit<User, "image" | "coverImage"> & {
  imageUrl?: string | null;
  coverImageUrl?: string | null;
};

export const getUserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }): Promise<UserWithUrls | null> => {
    // 1. Récupérer l'utilisateur via le composant
    const user: User = await ctx.runQuery(
      components.betterAuth.users.getUserBySlug,
      {
        slug,
      },
    );

    if (!user) return null;

    // 2. Résoudre les URLs, dans le contexte parent
    const [imageUrl, coverImageUrl] = await Promise.all([
      user.image ? ctx.storage.getUrl(user.image) : Promise.resolve(null),
      user.coverImage
        ? ctx.storage.getUrl(user.coverImage)
        : Promise.resolve(null),
    ]);

    return {
      ...user,
      imageUrl,
      coverImageUrl,
    };
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    patch: partial(userValidator.omit("createdAt", "updatedAt")),
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
