import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { JobsClient } from "./_component/JobClient";

export default async function JobsPage() {
  const preloadedJobs = await preloadQuery(api.jobs.getJobs, {});
  return (
    <div>
      <JobsClient preloadedJobs={preloadedJobs} />
    </div>
  );
}
