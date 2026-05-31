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

describe("Chat", () => {
  let t: ReturnType<typeof convexTest>;
  let communityId: Id<"communities">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    const communityResult = await t.mutation(api.communities.mutations.createCommunty, {
      name: "Chat Community",
      description: "Description",
      privacy: "public",
    });
    communityId = communityResult.comId;
  });

  it("should send a message", async () => {
    await t.mutation(api.chat.mutations.sendMessage, {
      communityId,
      content: "Hello World",
    });

    const msg = await t.run(async (ctx) => {
      return await ctx.db.query("communityMessages").first();
    });
    expect(msg?.content).toBe("Hello World");
  });

  it("should edit a message", async () => {
    await t.mutation(api.chat.mutations.sendMessage, {
      communityId,
      content: "Hello World",
    });

    const msg = await t.run(async (ctx) => {
      return await ctx.db.query("communityMessages").first();
    });

    await t.mutation(api.chat.mutations.editMessage, {
      id: msg!._id,
      communityId,
      content: "Updated Hello",
    });

    const updatedMsg = await t.run(async (ctx) => {
      return await ctx.db.get(msg!._id);
    });
    expect(updatedMsg?.content).toBe("Updated Hello");
  });

  it("should delete a message", async () => {
    await t.mutation(api.chat.mutations.sendMessage, {
      communityId,
      content: "Hello World",
    });

    const msg = await t.run(async (ctx) => {
      return await ctx.db.query("communityMessages").first();
    });

    await t.mutation(api.chat.mutations.deleteMessage, {
      id: msg!._id,
      communityId,
    });

    const deletedMsg = await t.run(async (ctx) => {
      return await ctx.db.get(msg!._id);
    });
    expect(deletedMsg).toBeNull();
  });
});
