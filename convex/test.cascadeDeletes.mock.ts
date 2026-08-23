/**
 * Global mock for cascade deletes.
 * We only stub `runCascadeDelete` (the function actually called by
 * convex/posts/actions.ts) instead of the whole module, so
 * `cascadeRelationships` and other exports stay real in case anything
 * else needs them.
 *
 * `cascadingDeletes` itself (the CascadingDeletes(components.convexCascadingDeletes, ...)
 * instance) is created lazily and only touches the component boundary when
 * `.deleteWithCascade` is actually called — which we bypass entirely here.
 */
import { vi } from "vitest";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

vi.mock("./cascadeDeletes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./cascadeDeletes")>();
  return {
    ...actual,
    // `convex-test` does not execute component functions. Delete the root
    // document through the same internal helper so action tests still verify
    // their observable behaviour. Relationship traversal belongs to the
    // component's own integration tests.
    runCascadeDelete: vi.fn(
      async (ctx: ActionCtx, table: string, id: string) => {
        await ctx.runMutation(internal.cascadeHelpers.deleteDocument, {
          table,
          id,
        });
        return { [table]: 1 };
      },
    ),
  };
});
