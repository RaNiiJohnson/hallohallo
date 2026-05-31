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

describe("Communities", () => {
  let t: ReturnType<typeof convexTest>;
  let communityId: Id<"communities">;
  let communitySlug: string;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Community Name",
      description: "Community Description",
      privacy: "public",
    });

    communityId = communityResult.comId;
    communitySlug = communityResult.slug;
  });

  it("should have created a community", async () => {
    const result = await t.query(api.communities.queries.getCommunity, {
      slug: communitySlug,
    });
    expect(result?.name).toBe("Community Name");
  });

  it("should update a community", async () => {
    await t.mutation(api.communities.mutations.updateCommunity, {
      id: communityId,
      name: "Updated Community Name",
      description: "Updated Description",
      privacy: "public",
    });

    const result = await t.query(api.communities.queries.getCommunity, {
      slug: communitySlug,
    });
    expect(result?.name).toBe("Updated Community Name");
  });

  it("should delete a community", async () => {
    await t.mutation(api.communities.mutations.deleteCommunity, {
      id: communityId,
    });

    const result = await t.query(api.communities.queries.getCommunity, {
      slug: communitySlug,
    });
    expect(result).toBeNull();
  });
});
