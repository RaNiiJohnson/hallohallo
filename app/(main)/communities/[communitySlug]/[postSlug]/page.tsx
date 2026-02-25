import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import PostClient from "./postClient";
interface Props {
  params: Promise<{ communitySlug: string; postSlug: string }>;
}

export default async function page({ params }: Props) {
  const { postSlug } = await params;

  const preloadedPost = await preloadQuery(api.posts.posts.getPostWithMeta, {
    slug: postSlug,
  });

  return <PostClient preloadedPost={preloadedPost} />;
}
