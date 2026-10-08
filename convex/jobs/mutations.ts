import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import {
  isContractTypeAllowedForJobType,
  type ContractType,
  type JobType,
} from "../../src/lib/job-offer-options";
import { authComponent } from "../auth/auth";
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

const jobTypeValidator = v.union(
  v.literal("auPair"), v.literal("training"), v.literal("voluntary"),
  v.literal("internship"), v.literal("miniJob"), v.literal("job"),
  v.literal("freelance"), v.literal("scholarship"),
);
const contractTypeValidator = v.union(
  v.literal("CDI"), v.literal("CDD"), v.literal("FSJ/FOJ/BFD"),
  v.literal("fullTime"), v.literal("partTime"), v.literal("freelance"),
  v.literal("apprenticeship"),
);
const jobContactEmailValidator = v.string();

function assertValidJobInput(args: {
  type: JobType;
  contractType: ContractType;
  workMode: "onSite" | "hybrid" | "remote";
  city: string;
  contactEmail: string;
}) {
  if (!isContractTypeAllowedForJobType(args.type, args.contractType)) {
    throwValidationError("This contract type is not available for the selected job type");
  }
  if (args.workMode !== "remote" && !args.city.trim()) {
    throwValidationError("City is required for on-site and hybrid jobs");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.contactEmail.trim())) {
    throwValidationError("Invalid application contact email");
  }
}

function isJobActive(status: "active" | "closed" | "archived" | undefined) {
  return status === undefined || status === "active";
}

export const createJob = authMutation({
  args: {
    title: v.string(),
    type: jobTypeValidator,
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: contractTypeValidator,
    city: v.string(),
    workMode: v.union(v.literal("onSite"), v.literal("hybrid"), v.literal("remote")),
    remoteLocation: v.optional(v.string()),
    duration: v.optional(v.string()),
    startDate: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    company: v.string(),
    description: v.string(),
    certificates: v.optional(v.array(v.string())),
    salary: v.optional(v.number()),
    salaryPeriod: v.optional(v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    )),
    sector: v.optional(v.string()),
    benefits: v.optional(v.string()),
    externalApplicationUrl: v.optional(v.string()),
    weeklyHours: v.optional(v.number()),
    trainingRequirements: v.optional(v.string()),
    contactEmail: jobContactEmailValidator,
  },
  handler: async (ctx, args) => {
    const user = ctx.user;

    if (user.userType !== "provider" && user.role !== "admin") {
      throwForbidden("Only providers or admins can publish jobs");
    }
    assertValidJobInput(args);
    const { contactEmail, ...jobArgs } = args;

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    const job = await ctx.db.insert("JobOffer", {
      ...jobArgs,
      certificates: args.certificates ?? [],
      slug: generatedSlug(args.title),
      authorId: user._id,
      authorName: user.name,
      status: "active",
      updatedAt: Date.now(),
      searchAll: searchAllContent,
    });
    await ctx.db.insert("JobContactInfo", {
      jobId: job,
      email: contactEmail.trim().toLowerCase(),
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
    type: jobTypeValidator,
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: contractTypeValidator,
    city: v.string(),
    workMode: v.union(v.literal("onSite"), v.literal("hybrid"), v.literal("remote")),
    remoteLocation: v.optional(v.string()),
    duration: v.optional(v.string()),
    startDate: v.optional(v.string()),
    applicationDeadline: v.optional(v.string()),
    company: v.string(),
    description: v.string(),
    certificates: v.optional(v.array(v.string())),
    salary: v.optional(v.number()),
    salaryPeriod: v.optional(v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    )),
    sector: v.optional(v.string()),
    benefits: v.optional(v.string()),
    externalApplicationUrl: v.optional(v.string()),
    weeklyHours: v.optional(v.number()),
    trainingRequirements: v.optional(v.string()),
    contactEmail: v.optional(jobContactEmailValidator),
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
    const { id, contactEmail, ...updateData } = args;
    if (!isContractTypeAllowedForJobType(args.type, args.contractType)) {
      throwValidationError("This contract type is not available for the selected job type");
    }
    if (args.workMode !== "remote" && !args.city.trim()) {
      throwValidationError("City is required for on-site and hybrid jobs");
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      throwValidationError("Invalid application contact email");
    }

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    await ctx.db.patch(id, {
      ...updateData,
      searchAll: searchAllContent,
      updatedAt: Date.now(),
    });
    if (contactEmail) {
      const currentContact = await ctx.db.query("JobContactInfo").withIndex("by_jobId", (q) => q.eq("jobId", id)).unique();
      if (currentContact) await ctx.db.patch(currentContact._id, { email: contactEmail.trim().toLowerCase() });
      else await ctx.db.insert("JobContactInfo", { jobId: id, email: contactEmail.trim().toLowerCase() });
    }
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
  },
  handler: async (ctx, { jobId, applicationCvKey, coverLetter }) => {
    const candidate = await authComponent.safeGetAuthUser(ctx);
    if (!candidate) throwForbidden("Authentication required");
    const candidateId = candidate._id;

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

    const cvKey = applicationCvKey ?? candidate.cv ?? undefined;
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
