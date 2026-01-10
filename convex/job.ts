// convex/jobs.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getJobWithContact = query({
  args: { jobId: v.id("JobOffer") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;

    // Récupération rapide via l'index
    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    return { ...job, contact };
  },
});

// const existing = await ctx.db
//   .query("JobBookmark")
//   .withIndex("by_user_job", (q) =>
//     q.eq("userId", userId).eq("jobId", args.jobId)
//   )
//   .unique();
