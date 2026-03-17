import { components, internal } from "./_generated/api";
import { DataModel, Id } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate";
import { Migrations } from "@convex-dev/migrations";

export const postLikesCount = new TableAggregate<{
  Namespace: Id<"posts">;
  Key: null;
  DataModel: DataModel;
  TableName: "postLikes";
}>(components.aggregateByLikesPosts, {
  namespace: (doc) => doc.postId,
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

// ---- migrations ----

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const backfillPostLikesCountMigration = migrations.define({
  table: "postLikes",
  migrateOne: async (ctx, doc) => {
    await postLikesCount.insertIfDoesNotExist(ctx, doc);
  },
});

export const backfillPostCommentsCountMigration = migrations.define({
  table: "postComments",
  migrateOne: async (ctx, doc) => {
    await postCommentsCount.insertIfDoesNotExist(ctx, doc);
  },
});

export const backfillCommunityPostsCountMigration = migrations.define({
  table: "posts",
  migrateOne: async (ctx, doc) => {
    await communityPostsCount.insertIfDoesNotExist(ctx, doc);
  },
});

export const backfillCommunityMembersCountMigration = migrations.define({
  table: "communityMembers",
  migrateOne: async (ctx, doc) => {
    await communityMembersCount.insertIfDoesNotExist(ctx, doc);
  },
});

export const runAggregateBackfill = migrations.runner([
  internal.aggregates.backfillPostLikesCountMigration,
  internal.aggregates.backfillPostCommentsCountMigration,
  internal.aggregates.backfillCommunityPostsCountMigration,
  internal.aggregates.backfillCommunityMembersCountMigration,
]);
