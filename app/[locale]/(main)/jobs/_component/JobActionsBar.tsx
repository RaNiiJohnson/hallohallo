"use client";

import { useConvexAuth } from "convex/react";
import { PublishJobDialog } from "./dialogs/publishJobDialog";

export function JobActionsBar() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isAuthenticated || isLoading) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-1">
      <div className="flex-1" />
      <PublishJobDialog />
    </div>
  );
}
