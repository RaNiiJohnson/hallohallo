import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { JobDetailsPage } from "./jobClient";
import { Metadata } from "next";
interface Props {
  params: Promise<{ id: Id<"JobOffer"> }>;
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

export default async function Page({ params }: Props) {
  const { id } = await params;

  const preloadedJob = await preloadQuery(api.jobs.getJobWithContact, {
    id,
  });

  return <JobDetailsPage preloadedJob={preloadedJob} />;
}
