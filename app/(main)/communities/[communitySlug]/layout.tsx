import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ communitySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { communitySlug } = await params;
  const community = await fetchQuery(api.communities.getCommunity, {
    slug: communitySlug,
  });

  if (!community) {
    return {
      title: "Community not found",
    };
  }

  return {
    title: `${community.name} | Hallo Hallo`,
    description: community.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
