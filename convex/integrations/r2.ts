import { R2 } from "@convex-dev/r2";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { authComponent } from "../auth/auth";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx, bucket) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
  },
  onUpload: async (ctx, bucket, key) => {
    // Post upload operations can go here
  },
});
