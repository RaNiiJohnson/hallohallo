import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { authMutation, internalMutation } from "../functions";
import { assertVerifiedUpload, consumeUploadGrant } from "../integrations/r2";
import {
  throwForbidden,
  throwNotFound,
  throwValidationError,
} from "../utils/errors";

const jobStatusValidator = v.union(
  v.literal("active"),
  v.literal("closed"),
  v.literal("archived"),
);

function isJobActive(status: "active" | "closed" | "archived" | undefined) {
  return status === undefined || status === "active";
}

export const createJob = authMutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("auPair"),
      v.literal("training"),
      v.literal("voluntary"),
      v.literal("internship"),
      v.literal("miniJob"),
      v.literal("job"),
      v.literal("freelance"),
      v.literal("scholarship"),
    ),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: v.union(
      v.literal("CDI"),
      v.literal("CDD"),
      v.literal("FSJ/FOJ/BFD"),
      v.literal("fullTime"),
      v.literal("partTime"),
      v.literal("freelance"),
      v.literal("apprenticeship"),
    ),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.number(),
    salaryPeriod: v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    ),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;

    if (user.userType !== "provider" && user.role !== "admin") {
      throwForbidden("Only providers or admins can publish jobs");
    }

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    const job = await ctx.db.insert("JobOffer", {
      ...args,
      slug: generatedSlug(args.title),
      authorId: user._id,
      authorName: user.name,
      status: "active",
      updatedAt: Date.now(),
      searchAll: searchAllContent,
    });

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "job_created",
    //   properties: {
    //     job_id: job,
    //     type: args.type,
    //     city: args.city,
    //     contract_type: args.contractType,
    //   },
    // });

    return job;
  },
});

export const updateJob = authMutation({
  args: {
    id: v.id("JobOffer"),
    title: v.string(),
    type: v.union(
      v.literal("auPair"),
      v.literal("training"),
      v.literal("voluntary"),
      v.literal("internship"),
      v.literal("miniJob"),
      v.literal("job"),
      v.literal("freelance"),
      v.literal("scholarship"),
    ),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: v.union(
      v.literal("CDI"),
      v.literal("CDD"),
      v.literal("FSJ/FOJ/BFD"),
      v.literal("fullTime"),
      v.literal("partTime"),
      v.literal("freelance"),
      v.literal("apprenticeship"),
    ),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.number(),
    salaryPeriod: v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throwNotFound("Job not found");

    const isOwner = existing.authorId === ctx.user._id;
    const isAdmin = ctx.user.role === "admin";
    if (!isOwner && !isAdmin) {
      throwForbidden("Not allowed to update this job");
    }

    // Remove id from args before updating because it's not a field of the document
    const { id, ...updateData } = args;

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    await ctx.db.patch(id, {
      ...updateData,
      searchAll: searchAllContent,
      updatedAt: Date.now(),
    });
  },
});

export const deleteJob = authMutation({
  args: {
    id: v.id("JobOffer"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throwNotFound("Job not found");

    const isOwner = existing.authorId === ctx.user._id;
    const isAdmin = ctx.user.role === "admin";
    if (!isOwner && !isAdmin) {
      throwForbidden("Not allowed to delete this job");
    }

    await ctx.db.patch(args.id, { status: "archived", updatedAt: Date.now() });

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "job_deleted",
    //   properties: { job_id: args.id },
    // });
    return null;
  },
});

export const setJobStatus = authMutation({
  args: { id: v.id("JobOffer"), status: jobStatusValidator },
  returns: v.null(),
  handler: async (ctx, { id, status }) => {
    const job = await ctx.db.get(id);
    if (!job) throwNotFound("Job not found");
    if (job.authorId !== ctx.user._id && ctx.user.role !== "admin") {
      throwForbidden("Not allowed to change this job status");
    }
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    return null;
  },
});

export const submitApplication = internalMutation({
  args: {
    jobId: v.id("JobOffer"),
    applicationCvKey: v.optional(v.string()),
    coverLetter: v.optional(v.string()),
    candidateId: v.string(),
    profileCv: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { jobId, applicationCvKey, coverLetter, candidateId, profileCv },
  ) => {
    const job = await ctx.db.get(jobId);
    if (!job) throwNotFound("Job not found");
    if (!isJobActive(job.status)) {
      throwValidationError("This job is no longer accepting applications");
    }
    if (job.authorId === candidateId) {
      throwForbidden("You cannot apply to your own job");
    }

    const existing = await ctx.db
      .query("jobApplications")
      .withIndex("by_jobId_and_candidateId", (q) =>
        q.eq("jobId", jobId).eq("candidateId", candidateId),
      )
      .unique();
    if (existing) {
      throwValidationError("You have already applied to this job");
    }

    const cvKey = applicationCvKey ?? profileCv;
    if (!cvKey) throwNotFound("CV not found");
    if (applicationCvKey) {
      await assertVerifiedUpload(ctx, {
        key: applicationCvKey,
        userId: candidateId,
        kind: "applicationCv",
      });
    }

    const applicationId = await ctx.db.insert("jobApplications", {
      jobId,
      candidateId,
      cvKey,
      coverLetter,
      appliedAt: Date.now(),
      emailStatus: "pending",
    });
    if (applicationCvKey) await consumeUploadGrant(ctx, applicationCvKey);

    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .unique();

    return {
      applicationId,
      jobTitle: job.title,
      authorId: job.authorId,
      contactEmail: contact?.email,
      cvKey,
    };
  },
});

export const updateApplicationEmailStatus = internalMutation({
  args: {
    id: v.id("jobApplications"),
    emailStatus: v.union(v.literal("sent"), v.literal("failed")),
  },
  returns: v.null(),
  handler: async (ctx, { id, emailStatus }) => {
    await ctx.db.patch(id, { emailStatus });
    return null;
  },
});
