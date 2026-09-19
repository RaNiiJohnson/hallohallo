import { v } from "convex/values";
import z from "zod";
import { api, internal } from "../_generated/api";
import { action } from "../functions";
import { translateWithOpenAI, TranslationSchema } from "./translate.lib";

type JobTranslation = z.infer<typeof TranslationSchema>;

export const translateJob = action({
  args: {
    jobId: v.id("JobOffer"),
    targetLanguage: v.union(v.literal("fr"), v.literal("en"), v.literal("de")),
  },

  returns: v.object({
    title: v.string(),
    description: v.string(),
  }),

  handler: async (ctx, args): Promise<JobTranslation> => {
    const job = await ctx.runQuery(api.jobs.queries.getJobWithContactById, {
      id: args.jobId,
    });

    if (!job) {
      throw new Error("Job not found");
    }

    const cached = await ctx.runQuery(api.jobs.queries.getTranslation, {
      jobId: args.jobId,
      language: args.targetLanguage,
    });

    if (cached && cached.sourceUpdatedAt === job.updatedAt) {
      return {
        title: cached.title,
        description: cached.description,
      };
    }

    const translated = await translateWithOpenAI(
      job.title,
      job.description,
      args.targetLanguage,
    );

    await ctx.runMutation(internal.jobs.mutations.saveTranslation, {
      jobId: args.jobId,
      language: args.targetLanguage,
      title: translated.title,
      description: translated.description,
      sourceUpdatedAt: job.updatedAt,
    });

    return translated;
  },
});
