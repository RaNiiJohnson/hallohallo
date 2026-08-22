import { v } from "convex/values";
import { render } from "react-email";
import { api } from "../_generated/api";
import { action } from "../_generated/server";
import { posthog, posthogDistinctId } from "../integrations/posthog";
import { resend } from "../sendEmails";
import NewApplicationEmail from "./CvTemplate";

export const applyToJob = action({
  args: {
    jobId: v.id("JobOffer"),
    cvStorageId: v.string(),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.auth.auth.getCurrentUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const distinctId = posthogDistinctId(user._id);

    try {
      const job = await ctx.runQuery(api.jobs.queries.getJobWithContactById, {
        id: args.jobId,
      });
      if (!job) {
        throw new Error("Job not found");
      }

      const cvUrl = await ctx.runQuery(api.jobs.queries.getR2FileUrl, {
        storageId: args.cvStorageId,
      });
      if (!cvUrl) {
        throw new Error("CV not found");
      }

      let contactEmail = job.contact?.email;
      if (!contactEmail) {
        const authorUser = await ctx.runQuery(api.auth.users.getUserById, {
          id: job.authorId,
        });
        contactEmail = authorUser?.email;
      }
      if (!contactEmail) {
        throw new Error("No contact email found for this job.");
      }

      if (user.email === contactEmail) {
        throw new Error("You cannot apply to your own job.");
      }

      const html = await render(
        NewApplicationEmail({
          candidateName: user.name,
          candidateEmail: user.email,
          jobTitle: job.title,
          coverLetter: args.coverLetter,
          cvUrl,
        }),
      );

      await resend.sendEmail(ctx, {
        from: "HalloHallo <noreply@hallomada.de>",
        to: contactEmail,
        subject: `Nouvelle candidature pour: ${job.title}`,
        html,
      });

      await posthog.capture(ctx, {
        distinctId,
        event: "job_application_submitted",
        properties: {
          job_id: args.jobId,
          job_title: job.title,
        },
      });
    } catch (error) {
      await posthog.captureException(ctx, {
        error,
        distinctId,
        additionalProperties: { job_id: args.jobId },
      });
      throw error;
    }
  },
});
