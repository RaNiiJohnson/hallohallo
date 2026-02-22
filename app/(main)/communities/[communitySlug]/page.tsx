import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import CommunityClient from "./communityClient";

interface Props {
  params: Promise<{ communitySlug: string }>;
}

export default async function page({ params }: Props) {
  const { communitySlug } = await params;

  const preloadedCommunity = await preloadQuery(
    api.communities.getCommunityWithPosts,
    { slug: communitySlug },
  );

  return <CommunityClient preloadedCommunity={preloadedCommunity} />;
}
