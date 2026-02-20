import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generatedSlug } from "../src/lib/utils";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";
import { getManyFrom } from "convex-helpers/server/relationships";

export const createCommunty = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("secret"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const comId = await ctx.db.insert("communities", {
      name: args.name,
      slug: generatedSlug(args.name),
      description: args.description,
      authorId: user._id,
      authorName: user.name,
      privacy: args.privacy,
      searchAll: `${args.name} ${args.description} ${user.name}`,
    });

    await ctx.db.insert("communityMembers", {
      userId: user._id,
      communityId: comId,
      role: "admin",
    });

    return comId;
  },
});

export const getAllCommunities = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const communities = await ctx.db
      .query("communities")
      .order("desc")
      .paginate(args.paginationOpts);
    return communities;
  },
});

export const getCommunityWithPosts = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const community = await ctx.db
      .query("communities")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!community) return null;

    const posts = await getManyFrom(
      ctx.db,
      "posts",
      "by_communityId",
      community._id,
      "communityId",
    );

    // Pour la liste, juste les counts — pas besoin du détail complet
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const [likes, comments] = await Promise.all([
          getManyFrom(ctx.db, "postLikes", "by_postId", post._id, "postId"),
          getManyFrom(ctx.db, "postComments", "by_postId", post._id, "postId"),
        ]);
        return {
          ...post,
          likesCount: likes.length,
          commentsCount: comments.length,
        };
      }),
    );

    return { ...community, posts: postsWithCounts };
  },
});

export const updateCommunity = mutation({
  args: {
    id: v.id("communities"),
    name: v.string(),
    description: v.string(),
    privacy: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("secret"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }
    const community = await ctx.db.get(args.id);
    if (!community) {
      throw new Error("Community not found");
    }
    if (community.authorId !== user._id) {
      throw new Error("Not authorized");
    }
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      privacy: args.privacy,
      searchAll: `${args.name} ${args.description} ${user.name}`,
    });
  },
});

export const deleteCommunity = mutation({
  args: {
    id: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.id);
    if (!community) throw new Error("Community not found");
    if (community.authorId !== user._id) throw new Error("Not authorized");

    // 1. Tous les posts de la communauté
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();

    for (const post of posts) {
      // 2. Likes du post
      const postLikes = await ctx.db
        .query("postLikes")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .collect();
      for (const like of postLikes) await ctx.db.delete(like._id);

      // 3. Commentaires du post
      const comments = await ctx.db
        .query("postComments")
        .withIndex("by_postId", (q) => q.eq("postId", post._id))
        .collect();

      for (const comment of comments) {
        // 4. Likes du commentaire
        const commentLikes = await ctx.db
          .query("postCommentLikes")
          .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
          .collect();
        for (const like of commentLikes) await ctx.db.delete(like._id);

        // 5. Replies du commentaire
        const replies = await ctx.db
          .query("postCommentReplies")
          .withIndex("by_commentId", (q) => q.eq("commentId", comment._id))
          .collect();

        for (const reply of replies) {
          // 6. Likes des replies
          const replyLikes = await ctx.db
            .query("postCommentReplyLikes")
            .withIndex("by_replyId", (q) => q.eq("replyId", reply._id))
            .collect();
          for (const like of replyLikes) await ctx.db.delete(like._id);

          await ctx.db.delete(reply._id);
        }

        await ctx.db.delete(comment._id);
      }

      await ctx.db.delete(post._id);
    }

    // 7. Members de la communauté
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.id))
      .collect();
    for (const member of members) await ctx.db.delete(member._id);

    // 8. Supprimer la communauté
    await ctx.db.delete(args.id);
  },
});

export const joinCommunity = mutation({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    await ctx.db.insert("communityMembers", {
      userId: user._id,
      communityId: args.communityId,
      role: "member",
    });
  },
});

export const leaveCommunity = mutation({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get("communities", args.communityId);
    if (!community) throw new Error("Community not found");

    const membership = await ctx.db
      .query("communityMembers")
      .withIndex("by_userId_communityId", (q) =>
        q.eq("userId", user._id).eq("communityId", args.communityId),
      )
      .unique();

    if (!membership) {
      // optionally: throw or just return
      throw new Error("Membership not found");
    }

    await ctx.db.delete("communityMembers", membership._id);
  },
});

export const getCommunityMembers = query({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.communityId))
      .collect();
    return members;
  },
});

export const getCommunityMembersWithUser = query({
  args: {
    communityId: v.id("communities"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_communityId", (q) => q.eq("communityId", args.communityId))
      .collect();
    return members;
  },
});

export const inviteToCommunity = mutation({
  args: {
    communityId: v.id("communities"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const community = await ctx.db.get(args.communityId);
    if (!community) throw new Error("Community not found");

    await ctx.db.insert("communityMembers", {
      userId: args.userId,
      communityId: args.communityId,
      role: "member",
    });
  },
});
