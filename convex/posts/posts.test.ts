/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
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

vi.mock("../aggregates", async () => {
  const { aggregatesMock } = await import("../test.aggregates.mock");
  return aggregatesMock;
});

describe("Posts", () => {
  let t: ReturnType<typeof convexTest>;
  let postId: Id<"posts">;
  let postSlug: string;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Post Community",
      description: "Description",
      privacy: "public",
    });

    postId = (await t.mutation(api.posts.mutations.createPost, {
      title: "Post Title",
      content: "Post Content",
      communityId: communityResult.comId,
    })) as Id<"posts">;

    const post = await t.run(async (ctx) => await ctx.db.get(postId));
    postSlug = post!.slug;
  });

  it("should have created a post", async () => {
    const result = await t.query(api.posts.queries.getPostWithMeta, {
      slug: postSlug,
    });
    expect(result?.title).toBe("Post Title");
  });

  it("should update a post", async () => {
    await t.mutation(api.posts.mutations.updatePost, {
      postId,
      title: "Updated Post Title",
      content: "Updated Post Content",
    });

    const result = await t.query(api.posts.queries.getPostWithMeta, {
      slug: postSlug,
    });
    expect(result?.title).toBe("Updated Post Title");
  });

  it("should delete a post", async () => {
    await t.action(api.posts.actions.deletePost, {
      postId,
    });

    const result = await t.query(api.posts.queries.getPostWithMeta, {
      slug: postSlug,
    });
    expect(result).toBeNull();
  });
});
