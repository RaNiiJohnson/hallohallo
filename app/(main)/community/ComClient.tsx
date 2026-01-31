"use client";

import { api } from "@convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { notFound } from "next/navigation";

export default function ComClient({
  preloadedUsers,
}: {
  preloadedUsers: Preloaded<typeof api.users.getAllUsers>;
}) {
  const users = usePreloadedQuery(preloadedUsers);

  if (!users) {
    return notFound();
  }
  return (
    <div>
      <h1>ComClient</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
