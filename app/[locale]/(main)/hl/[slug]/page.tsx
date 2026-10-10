import { api } from "@convex/_generated/api";
import { preloadAuthQuery } from "@/lib/auth-server";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import UserClient from "./UserClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const user = await fetchQuery(api.auth.users.getUserBySlug, {
    slug,
  });

  if (!user) {
    return {
      title: "User not found",
    };
  }

  return {
    title: `${user.name} | HalloHallo`,
    description: user.headline,
  };
}

export default async function UserPage({ params }: Props) {
  const { slug } = await params;
  const user = await preloadAuthQuery(api.auth.users.getUserBySlug, { slug });
  return <UserClient preloadedUser={user} />;
}
