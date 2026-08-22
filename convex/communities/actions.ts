import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalMutation } from "../_generated/server";
import { authComponent } from "../auth/auth";
import { runCascadeDelete } from "../cascadeDeletes";
import { posthog, posthogDistinctId } from "../integrations/posthog";

/**
 * Vérifie que l'utilisateur authentifié est bien le propriétaire de la communauté.
 * Appelé depuis l'action deleteCommunity via ctx.runQuery.
 */
export const _verifyDeleteAuth = internalMutation({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Community not found");
    if (community.authorId !== user._id) throw new Error("Not authorized");

    return {
      communityId: community._id,
      slug: community.slug,
      userId: user._id,
    };
  },
});

/**
 * Supprime une communauté et tous ses documents enfants
 * (members, messages, posts, likes, comments, replies, reply likes)
 * en utilisant le cascade delete.
 */
export const deleteCommunity = action({
  args: { id: v.id("communities") },
  handler: async (ctx, args) => {
    // 1. Vérifier l'authentification et l'autorisation
    const { slug, userId } = await ctx.runMutation(
      internal.communities.actions._verifyDeleteAuth,
      {
        id: args.id,
      },
    );

    await ctx.runMutation(internal.notifications.mutations.deleteByCommunity, {
      slug,
    });

    const counts = await runCascadeDelete(ctx, "communities", args.id);

    await posthog.capture(ctx, {
      distinctId: posthogDistinctId(userId),
      event: "community_deleted",
      properties: { community_id: args.id, slug },
    });

    return counts;
  },
});
