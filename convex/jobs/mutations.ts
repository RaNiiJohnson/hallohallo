import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth/auth";

export const createJob = mutation({
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
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
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
    return job;
  },
});

export const updateJob = mutation({
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
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throw new Error("Job not found");

    // Remove id from args before updating because it's not a field of the document
    const { id, ...updateData } = args;

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    await ctx.db.patch("JobOffer", id, {
      ...updateData,
      searchAll: searchAllContent,
    });
  },
});

export const deleteJob = mutation({
  args: {
    id: v.id("JobOffer"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throw new Error("Job not found");

    await ctx.db.delete("JobOffer", args.id);
  },
});
