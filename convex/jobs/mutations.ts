import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { authMutation, internalMutation } from "../functions";
import { throwForbidden, throwNotFound } from "../utils/errors";

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
    });
  },
});

export const deleteJob = authMutation({
  args: {
    id: v.id("JobOffer"),
  },
  handler: async (ctx, args) => {
    // const user = ctx.user;

    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throw new Error("Job not found");

    await ctx.db.delete("JobOffer", args.id);

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "job_deleted",
    //   properties: { job_id: args.id },
    // });
  },
});

export const saveTranslation = internalMutation({
  args: {
    jobId: v.id("JobOffer"),
    language: v.union(v.literal("fr"), v.literal("en"), v.literal("de")),
    title: v.string(),
    description: v.string(),
    sourceUpdatedAt: v.number(),
  },

  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("jobTranslations")
      .withIndex("by_job_language", (q) =>
        q.eq("jobId", args.jobId).eq("language", args.language),
      )
      .unique();

    if (existing) {
      if (args.sourceUpdatedAt < existing.sourceUpdatedAt) {
        return existing._id;
      }
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        sourceUpdatedAt: args.sourceUpdatedAt,
      });

      return existing._id;
    }

    return await ctx.db.insert("jobTranslations", {
      ...args,
    });
  },
});
