import { api } from "@convex/_generated/api";

export type AuthUser = NonNullable<typeof api.auth.getCurrentUser._returnType>;

type JobsReturn = typeof api.jobs.getJobs._returnType;

export type JobOfferListItem = JobsReturn[number];

export type JobOfferDetails = NonNullable<
  typeof api.jobs.getJobWithContact._returnType
>;
