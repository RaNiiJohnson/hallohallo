import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchQuery(api.jobs.getJobMetadata, {
    slug: id,
  });

  if (!job) {
    return {
      title: "Job not found",
    };
  }

  const title = `${job.title} | Hallo Hallo`;
  // Limit description to ~160 chars for SEO best practices, removing newlines if necessary
  const description = job.description?.substring(0, 160) || "Offre d'emploi sur HalloHallo";

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
