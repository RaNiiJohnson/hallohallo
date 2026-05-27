import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ communitySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { communitySlug } = await params;
  const community = await fetchQuery(api.communities.queries.getCommunity, {
    slug: communitySlug,
  });

  if (!community) {
    return {
      title: "Community not found",
    };
  }

  const title = `${community.name} | Hallo Hallo`;
  const description = community.description?.substring(0, 160) || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "HalloHallo",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
