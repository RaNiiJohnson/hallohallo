import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ communitySlug: string; postSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postSlug } = await params;
  const post = await fetchQuery(api.posts.posts.getPostWithMeta, {
    slug: postSlug,
  });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: `${post.title} | Hallo Hallo`,
    description: post.content,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
