"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";

export default function JobsPage() {
  const jobs = useQuery(api.jobs.getJobs, {});

  if (jobs === undefined) {
    return <div>Loading...</div>;
  }

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
