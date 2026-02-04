import { api } from "@convex/_generated/api";
import { userValidator } from "@convex/betterAuth/users";
import { Infer } from "convex/values";

export type AuthUser = NonNullable<typeof api.auth.getCurrentUser._returnType>;

type JobsReturn = typeof api.jobs.getJobs._returnType;

export type JobOfferListItem = JobsReturn["page"][number];

export type JobOfferDetails = NonNullable<
  typeof api.jobs.getJobWithContact._returnType
>;

export type ListingsReturn = typeof api.listings.getListing._returnType;

export type ListingListItem = ListingsReturn["page"][number];

export type ListingListDetails = NonNullable<
  typeof api.listings.getListingWithContact._returnType
>;

const UpdateUserPatch = userValidator.omit("createdAt", "updatedAt").partial();
export type UpdateUserPatch = Infer<typeof UpdateUserPatch>;
