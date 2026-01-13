"use client";

import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function JobsClient(props: {
  preloadedJobs: Preloaded<typeof api.jobs.getJobs>;
}) {
  const jobs = usePreloadedQuery(props.preloadedJobs);

  return (
    <div>
      <h1>Jobs</h1>
      <ul>
        {jobs.map((job) => (
          <li key={job._id}>{job.title}</li>
        ))}
      </ul>
    </div>
  );
}
