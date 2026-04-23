import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchQuery(api.listings.getListingMetadata, {
    slug: id,
  });

  if (!listing) {
    return {
      title: "Listing not found",
    };
  }

  const title = `${listing.title} | Hallo Hallo`;
  const description = listing.description?.substring(0, 160) || "Annonce immobilière sur HalloHallo";
  const imageUrl = listing.images?.[0]?.secureUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "HalloHallo",
      ...(imageUrl && {
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: listing.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

export default function JobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
