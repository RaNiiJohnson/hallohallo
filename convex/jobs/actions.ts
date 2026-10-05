import { v } from "convex/values";
import { render } from "react-email";
import { api, internal } from "../_generated/api";
import { authAction } from "../functions";
import { r2 } from "../integrations/r2";
import { resend } from "../sendEmails";
import { throwForbidden, throwNotFound } from "../utils/errors";
import NewApplicationEmail from "./CvTemplate";

export const applyToJob = authAction({
  args: {
    jobId: v.id("JobOffer"),
    coverLetter: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = ctx.user;

    // const distinctId = posthogDistinctId(user._id);

    try {
      const job = await ctx.runQuery(api.jobs.queries.getJobWithContactById, {
        id: args.jobId,
      });
      if (!job) {
        throwNotFound("Job not found");
      }

      if (!user.cv) throwNotFound("CV not found");
      const cvUrl = await r2.getUrl(user.cv);
      if (!cvUrl) {
        throwNotFound("CV not found");
      }

      let contactEmail = job.contact?.email;
      if (!contactEmail) {
        contactEmail =
          (await ctx.runQuery(internal.auth.users.getContactEmailById, {
            id: job.authorId,
          })) ?? undefined;
      }
      if (!contactEmail) {
        throwNotFound("No contact email found for this job.");
      }

      if (user.email === contactEmail) {
        throwForbidden("You cannot apply to your own job.");
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

      return null;

      // await posthog.capture(ctx, {
      //   distinctId,
      //   event: "job_application_submitted",
      //   properties: {
      //     job_id: args.jobId,
      //     job_title: job.title,
      //   },
      // });
    } catch (error) {
      // await posthog.captureException(ctx, {
      //   error,
      //   distinctId,
      //   additionalProperties: { job_id: args.jobId },
      // });
      throw error;
    }
  },
});
