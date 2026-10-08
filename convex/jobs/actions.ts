import { v } from "convex/values";
import { render } from "react-email";
import { internal } from "../_generated/api";
import { authAction } from "../functions";
import { r2 } from "../integrations/r2";
import { resend } from "../sendEmails";
import { throwNotFound } from "../utils/errors";
import NewApplicationEmail from "./CvTemplate";

export const applyToJob = authAction({
  args: {
    jobId: v.id("JobOffer"),
    applicationCvKey: v.optional(v.string()),
    coverLetter: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = ctx.user;

    // const distinctId = posthogDistinctId(user._id);

    try {
      const application = await ctx.runMutation(
        internal.jobs.mutations.submitApplication,
        args,
      );

      try {
        let contactEmail = application.contactEmail;
        if (!contactEmail) {
          contactEmail =
            (await ctx.runQuery(internal.auth.users.getContactEmailById, {
              id: application.authorId,
            })) ?? undefined;
        }
        if (!contactEmail) {
          throwNotFound("No contact email found for this job.");
        }

        const cvUrl = await r2.getUrl(application.cvKey);
        if (!cvUrl) throwNotFound("CV not found");

        const html = await render(
          NewApplicationEmail({
            candidateName: user.name,
            candidateEmail: user.email,
            jobTitle: application.jobTitle,
            coverLetter: args.coverLetter,
            cvUrl,
          }),
        );

        await resend.sendEmail(ctx, {
          from: "HalloHallo <noreply@hallomada.de>",
          to: contactEmail,
          subject: `Nouvelle candidature pour: ${application.jobTitle}`,
          html,
        });
        await ctx.runMutation(internal.jobs.mutations.updateApplicationEmailStatus, {
          id: application.applicationId,
          emailStatus: "sent",
        });
      } catch (error) {
        await ctx.runMutation(internal.jobs.mutations.updateApplicationEmailStatus, {
          id: application.applicationId,
          emailStatus: "failed",
        });
        throw error;
      }

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
