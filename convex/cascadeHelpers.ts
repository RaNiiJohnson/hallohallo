import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { customMutation, customCtx } from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import {
  postLikesCount,
  postCommentsCount,
  communityPostsCount,
  communityMembersCount,
  postShuffle,
  postSortedByDate,
  postSortedByLikes,
} from "./aggregates";

const triggers = new Triggers<DataModel>();
triggers.register("postLikes", postLikesCount.trigger());
triggers.register("postComments", postCommentsCount.trigger());
triggers.register("posts", communityPostsCount.trigger());
triggers.register("communityMembers", communityMembersCount.trigger());
triggers.register("posts", postShuffle.trigger());
triggers.register("posts", postSortedByDate.trigger());
triggers.register("posts", postSortedByLikes.trigger());

const mutationWithTriggers = customMutation(
  internalMutation,
  customCtx(triggers.wrapDB)
);

/**
 * Generic resolver : trouve tous les documents enfants dans `sourceTable`
 * dont le champ `fieldName` (indexé par `indexName`) vaut `parentId`.
 * Retourne un tableau d'IDs (strings).
 */
export const resolveChildren = internalQuery({
  args: {
    sourceTable: v.string(),
    indexName: v.string(),
    fieldName: v.string(),
    parentId: v.string(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query(args.sourceTable as any)
      .withIndex(args.indexName as any, (q: any) =>
        q.eq(args.fieldName, args.parentId),
      )
      .collect();
    return docs.map((d: any) => d._id as string);
  },
});

/**
 * Generic deleter : supprime un document par table et ID,
 * avec les triggers activés pour mettre à jour les aggregates.
 */
export const deleteDocument = mutationWithTriggers({
  args: {
    table: v.string(),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id as any);
  },
});

