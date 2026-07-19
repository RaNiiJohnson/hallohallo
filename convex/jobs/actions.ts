import { v } from "convex/values";
import { render } from "react-email";
import { api } from "../_generated/api";
import { action } from "../_generated/server";
import { resend } from "../sendEmails";
import NewApplicationEmail from "./CvTemplate";

export const applyToJob = action({
  args: {
    jobId: v.id("JobOffer"),
    cvStorageId: v.string(),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // We cannot use authComponent directly in action, we need to call query
    const user = await ctx.runQuery(api.auth.auth.getCurrentUser);

    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the job info, we need a query that fetches job by id with contact
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

    // Use the job contact email if available, otherwise fallback to the author's email
    let contactEmail = job.contact?.email;
    if (!contactEmail) {
      // Fetch the job author's email as fallback
      const authorUser = await ctx.runQuery(api.auth.users.getUserById, {
        id: job.authorId,
      });
      contactEmail = authorUser?.email;
    }
    if (!contactEmail) {
      throw new Error("Aucun email de contact trouvé pour cette offre.");
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
  },
});
