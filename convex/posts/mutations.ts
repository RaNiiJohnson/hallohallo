import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { DataModel } from "../_generated/dataModel";
import { mutation } from "../_generated/server";
import {
  communityPostsCount,
  postCommentsCount,
  postLikesCount,
  postShuffle,
  postSortedByDate,
  postSortedByLikes,
} from "../aggregates";
import { authComponent } from "../auth/auth";

// ─── Triggers

const triggers = new Triggers<DataModel>();
triggers.register("posts", communityPostsCount.trigger());
triggers.register("postComments", postCommentsCount.trigger());
triggers.register("postLikes", postLikesCount.trigger());

const mutationWithTriggers = customMutation(
  mutation,
  customCtx(triggers.wrapDB),
);

export const createPost = mutationWithTriggers({
  args: {
    content: v.string(),
    title: v.string(),
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    const postId = await ctx.db.insert("posts", {
      slug: generatedSlug(args.title),
      authorId: user._id,
      content: args.content,
      title: args.title,
      authorName: user.name,
      communityId: args.communityId,
      communityName: community.name,
      communitySlug: community.slug,
      searchAll: `${args.title} ${args.content} ${user.name} ${community.name}`,
    });

    const postDoc = (await ctx.db.get(postId))!;
    await postShuffle.insert(ctx, postDoc);
    await postSortedByDate.insert(ctx, postDoc);
    await postSortedByLikes.insert(ctx, postDoc);

    return postId;
  },
});



export const updatePost = mutationWithTriggers({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user._id) throw new Error("Not authorized");

    await ctx.db.patch(args.postId, {
      content: args.content,
      title: args.title,
      searchAll: `${args.title} ${args.content} ${user.name}`,
    });
  },
});
