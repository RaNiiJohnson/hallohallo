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

describe("Bookmarks", () => {
  let t: ReturnType<typeof convexTest>;
  let postId: Id<"posts">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Bookmark Community",
      description: "Description",
      privacy: "public",
    });

    postId = (await t.mutation(api.posts.mutations.createPost, {
      title: "Test Post",
      content: "Test Content",
      communityId: communityResult.comId,
    })) as Id<"posts">;
  });

  it("should toggle a bookmark", async () => {
    const result1 = await t.mutation(api.bookmarks.mutations.toggleBookmark, {
      resourceId: postId,
      resourceType: "post",
    });
    expect(result1.bookmarked).toBe(true);

    const result2 = await t.mutation(api.bookmarks.mutations.toggleBookmark, {
      resourceId: postId,
      resourceType: "post",
    });
    expect(result2.bookmarked).toBe(false);
  });
});
