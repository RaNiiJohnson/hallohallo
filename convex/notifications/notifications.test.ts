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

describe("Notifications", () => {
  let t: ReturnType<typeof convexTest>;
  let notificationId: Id<"notifications">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    notificationId = await t.run(async (ctx) => {
      return await ctx.db.insert("notifications", {
        userId: "testUserId",
        type: "new_like",
        read: false,
        fromUserName: "Someone",
        message: "Liked your post",
      });
    });
  });

  it("should mark one notification as read", async () => {
    await t.mutation(api.notifications.mutations.markOneRead, {
      notificationId,
    });

    const notif = await t.run(async (ctx) => await ctx.db.get(notificationId));
    expect(notif?.read).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    await t.mutation(api.notifications.mutations.markAllRead, {});

    const notif = await t.run(async (ctx) => await ctx.db.get(notificationId));
    expect(notif?.read).toBe(true);
  });
});
