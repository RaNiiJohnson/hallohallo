import { R2 } from "@convex-dev/r2";
import { ConvexError, v } from "convex/values";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent } from "../auth/auth";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx, bucket) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
  },
  onUpload: async (ctx, bucket, key) => {
    // Post upload operations can go here
  },
});

/**
 * Internal mutation to delete an R2 object by its key.
 * Reusable from other mutations or actions.
 */
export const deleteR2Object = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    await r2.deleteObject(ctx, key);
  },
});

/**
 * Public mutation: upload a new CV key and delete the old one from R2.
 * - Deletes old CV from R2 if user had one
 * - Patches the user record with the new CV key
 */
export const uploadCvAndDeleteOld = mutation({
  args: {
    newCvKey: v.string(),
  },
  handler: async (ctx, { newCvKey }) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    // Delete old CV from R2 if it exists
    if (user.cv) {
      await r2.deleteObject(ctx, user.cv);
    }

    // Update user's CV field with the new key
    await ctx.runMutation(components.betterAuth.users.updateUser, {
      id: user._id,
      patch: { cv: newCvKey },
    });
  },
});

/**
 * Public mutation: delete the user's CV from R2 and clear the field.
 */
export const deleteCv = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    if (!user.cv) {
      throw new ConvexError("No CV to delete");
    }

    // Delete from R2
    await r2.deleteObject(ctx, user.cv);

    // Clear the CV field
    await ctx.runMutation(components.betterAuth.users.updateUser, {
      id: user._id,
      patch: { cv: null },
    });
  },
});

/**
 * Public query: get the URL for the user's CV.
 */
export const getCvUrl = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user || !user.cv) return null;
    return await r2.getUrl(user.cv);
  },
});
