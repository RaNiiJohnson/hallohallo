import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchQuery(api.jobs.getJobMetadata, {
    id,
  });

  if (!job) {
    return {
      title: "Job not found",
    };
  }

  return {
    title: job.title,
    description: job.description,
  };
}

export default function JobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
