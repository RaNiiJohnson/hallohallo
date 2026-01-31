import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import ComClient from "./ComClient";

export default async function page() {
  const users = await preloadQuery(api.users.getAllUsers);
  return <ComClient preloadedUsers={users} />;
}
