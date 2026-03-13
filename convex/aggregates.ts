import { components } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";
import { mutation } from "./_generated/server";

export const postLikesCount = new TableAggregate<{
  Namespace: Id<"posts">;
  Key: null;
  DataModel: DataModel;
  TableName: "postLikes";
}>(components.aggregateByLikesPosts, {
  namespace: (doc) => doc.postId,
  sortKey: () => null,
});

export const commentLikesCount = new TableAggregate<{
  Namespace: Id<"postComments">;
  Key: null;
  DataModel: DataModel;
  TableName: "postCommentLikes";
}>(components.aggregateByLikesComments, {
  namespace: (doc) => doc.commentId,
  sortKey: () => null,
});

export const commentLikesReplyCount = new TableAggregate<{
  Namespace: Id<"postCommentReplies">;
  Key: null;
  DataModel: DataModel;
  TableName: "postCommentReplyLikes";
}>(components.aggregateByLikesComments, {
  namespace: (doc) => doc.replyId,
  sortKey: () => null,
});

export const postCommentsCount = new TableAggregate<{
  Namespace: Id<"posts">;
  Key: null;
  DataModel: DataModel;
  TableName: "postComments";
}>(components.aggregateByComments, {
  namespace: (doc) => doc.postId,
  sortKey: () => null,
});

export const communityPostsCount = new TableAggregate<{
  Namespace: Id<"communities">;
  Key: null;
  DataModel: DataModel;
  TableName: "posts";
}>(components.aggregateByCommunityPosts, {
  namespace: (doc) => doc.communityId,
  sortKey: () => null,
});

export const communityMembersCount = new TableAggregate<{
  Namespace: Id<"communities">;
  Key: null;
  DataModel: DataModel;
  TableName: "communityMembers";
}>(components.aggregateByCommunityMembers, {
  namespace: (doc) => doc.communityId,
  sortKey: () => null,
});

export const backfill = mutation({
  handler: async (ctx) => {
    const likes = await ctx.db.query("postLikes").collect();
    for (const doc of likes)
      await postLikesCount.insertIfDoesNotExist(ctx, doc);

    const comments = await ctx.db.query("postComments").collect();
    for (const doc of comments)
      await postCommentsCount.insertIfDoesNotExist(ctx, doc);

    const posts = await ctx.db.query("posts").collect();
    for (const doc of posts)
      await communityPostsCount.insertIfDoesNotExist(ctx, doc);

    const members = await ctx.db.query("communityMembers").collect();
    for (const doc of members)
      await communityMembersCount.insertIfDoesNotExist(ctx, doc);
  },
});
