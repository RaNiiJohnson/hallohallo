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

describe("Likes", () => {
  let t: ReturnType<typeof convexTest>;
  let postId: Id<"posts">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Like Community",
      description: "Description",
      privacy: "public",
    });

    postId = (await t.mutation(api.posts.mutations.createPost, {
      title: "Test Post",
      content: "Test Content",
      communityId: communityResult.comId,
    })) as Id<"posts">;
  });

  it("should like and unlike a post", async () => {
    await t.mutation(api.posts.likes.mutations.likePost, { postId });

    let post = await t.run(async (ctx) => await ctx.db.get(postId));
    expect(post?.likesCount).toBe(1);

    await t.mutation(api.posts.likes.mutations.likePost, { postId });

    post = await t.run(async (ctx) => await ctx.db.get(postId));
    expect(post?.likesCount).toBe(0);
  });
});
