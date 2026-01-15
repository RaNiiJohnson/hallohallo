import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getJobWithContact = query({
  args: { id: v.id("JobOffer") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) return null;

    // Récupération rapide via l'index
    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.id))
      .unique();

    return { ...job, contact };
  },
});

export const getJobs = query({
  args: {},
  handler: async (ctx) => {
    const job = await ctx.db.query("JobOffer").order("desc").collect();
    return job;
  },
});

export const createJob = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    contractType: v.string(),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.string(),
    authorId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.insert("JobOffer", {
      ...args,
      authorId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return job;
  },
});
// const existing = await ctx.db
//   .query("JobBookmark")
//   .withIndex("by_user_job", (q) =>
//     q.eq("userId", userId).eq("jobId", args.jobId)
//   )
//   .unique();
