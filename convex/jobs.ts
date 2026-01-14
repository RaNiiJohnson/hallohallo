import { query } from "./_generated/server";
import { v } from "convex/values";

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

// const existing = await ctx.db
//   .query("JobBookmark")
//   .withIndex("by_user_job", (q) =>
//     q.eq("userId", userId).eq("jobId", args.jobId)
//   )
//   .unique();
