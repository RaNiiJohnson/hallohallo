/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../_generated/api";
import { Id } from "../../_generated/dataModel";
import schema from "../../schema";
import { modules } from "../../test.setup";

vi.mock("../../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../auth/auth")>();
  return {
    ...actual,
    authComponent: {
      ...actual.authComponent,
      safeGetAuthUser: vi.fn().mockResolvedValue({
        _id: "testUserId",
        name: "Test User",
      }),
    },
  };
});

vi.mock("../../aggregates", async () => {
  const { aggregatesMock } = await import("../../test.aggregates.mock");
  return aggregatesMock;
});

describe("Comments", () => {
  let t: ReturnType<typeof convexTest>;
  let postId: Id<"posts">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Comment Community",
      description: "Description",
      privacy: "public",
    });

    postId = await t.mutation(api.posts.mutations.createPost, {
      title: "Comment Post",
      content: "Content",
      communityId: communityResult.comId,
    });
  });

  it("should add a comment", async () => {
    const commentId = await t.mutation(api.posts.comments.mutations.addComment, {
      postId,
      content: "First Comment",
    });

    const comment = await t.run(async (ctx) => await ctx.db.get(commentId));
    expect(comment?.content).toBe("First Comment");
  });

  it("should update a comment", async () => {
    const commentId = await t.mutation(api.posts.comments.mutations.addComment, {
      postId,
      content: "First Comment",
    });

    await t.mutation(api.posts.comments.mutations.updateComment, {
      commentId,
      content: "Updated Comment",
    });

    const comment = await t.run(async (ctx) => await ctx.db.get(commentId));
    expect(comment?.content).toBe("Updated Comment");
  });

  it("should delete a comment", async () => {
    const commentId = await t.mutation(api.posts.comments.mutations.addComment, {
      postId,
      content: "First Comment",
    });

    await t.mutation(api.posts.comments.mutations.deleteComment, {
      commentId,
    });

    const comment = await t.run(async (ctx) => await ctx.db.get(commentId));
    expect(comment).toBeNull();
  });
});
