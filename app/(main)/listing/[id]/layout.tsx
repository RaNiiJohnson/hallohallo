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

  return {
    title: `${listing.title} | Hallo Hallo`,
    description: listing.description,
  };
}

export default function JobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
