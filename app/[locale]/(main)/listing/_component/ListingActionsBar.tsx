"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth } from "convex/react";
import { PublishListingDialog } from "./dialogs/publishListingDialog";

export function ListingActionsBar() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.auth.auth.getCurrentUser);

  if (
    !isAuthenticated ||
    isLoading ||
    (currentUser?.userType !== "provider" && currentUser?.role !== "admin")
  )
    return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-1">
      <div className="flex-1" />
      <PublishListingDialog />
    </div>
  );
}
