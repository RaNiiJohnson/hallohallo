import { api } from "@convex/_generated/api";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { JobDetailsPage } from "./jobClient";
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

  return {
    title: `${job.title} | Hallo Hallo`,
    description: job.description,
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const preloadedJob = await preloadQuery(api.jobs.getJobWithContact, {
    slug: id,
  });

  return <JobDetailsPage preloadedJob={preloadedJob} />;
}
