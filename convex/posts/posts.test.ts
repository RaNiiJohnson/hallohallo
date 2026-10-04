/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { limiter } from "../rateLimits";
import schema from "../schema";
import { modules } from "../test.setup";

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue({
      user: { _id: "testUserId", id: "testUserId", name: "Test User" },
    }),
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

    const communityResult = await t.mutation(
      api.communities.mutations.createCommunity,
      {
        name: "Post Community",
        description: "Description",
        privacy: "public",
      },
    );

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

  it("should create a public post without a community", async () => {
    const publicPostId = (await t.mutation(api.posts.mutations.createPost, {
      title: "Public Post",
      content: "This post belongs to the public feed.",
    })) as Id<"posts">;

    const publicPost = await t.run(async (ctx) =>
      await ctx.db.get(publicPostId),
    );
    expect(publicPost?.scope).toBe("public");
    expect(publicPost?.communityId).toBeUndefined();
  });

  it("should refuse a post in a community the author has not joined", async () => {
    const otherCommunityId = await t.run(async (ctx) =>
      await ctx.db.insert("communities", {
        name: "Someone Else's Community",
        slug: "someone-elses-community",
        description: "A community the current user has not joined.",
        authorId: "another-user",
        privacy: "public",
      }),
    );

    await expect(
      t.mutation(api.posts.mutations.createPost, {
        title: "Unauthorized Post",
        content: "This attempt must be rejected by the server.",
        communityId: otherCommunityId,
      }),
    ).rejects.toThrow("You must be a community member to post");
  });

  it("should list only the author's communities as post destinations", async () => {
    await t.run(async (ctx) =>
      await ctx.db.insert("communities", {
        name: "Not My Community",
        slug: "not-my-community",
        description: "The current user is not a member of this community.",
        authorId: "another-user",
        privacy: "public",
      }),
    );

    const destinations = await t.query(
      api.communities.queries.getMyCommunitiesForPosting,
      {},
    );
    expect(destinations).toHaveLength(1);
    expect(destinations[0]?.name).toBe("Post Community");
    expect(destinations[0]?.role).toBe("admin");
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

  it("should not create a post when the rate limit is reached", async () => {
    vi.mocked(limiter.limit).mockResolvedValueOnce({
      ok: false,
      retryAfter: 60,
    });

    const result = await t.mutation(api.posts.mutations.createPost, {
      title: "Rate limited post",
      content: "Post Content",
      communityId: (await t.query(api.posts.queries.getPostWithMeta, {
        slug: postSlug,
      }))!.communityId,
    });

    expect(result).toEqual({ retryAfter: 60 });
  });
});
