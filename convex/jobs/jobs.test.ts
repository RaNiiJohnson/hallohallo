/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";

const authState = vi.hoisted(() => ({
  user: {
    _id: "testUserId",
    id: "testUserId",
    name: "Test User",
    email: "candidate@example.com",
    userType: "provider",
    role: "user",
    cv: "cv/owned.pdf" as string | null,
  },
}));

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockImplementation(async () => ({
      user: authState.user,
    })),
    authComponent: {
      ...actual.authComponent,
      safeGetAuthUser: vi.fn().mockImplementation(async () => ({
        _id: authState.user._id,
        name: authState.user.name,
        userType: authState.user.userType,
      })),
    },
  };
});

describe("Jobs", () => {
  let t: ReturnType<typeof convexTest>;
  let jobId: Id<"JobOffer">;
  let jobSlug: string;

  beforeEach(async () => {
    authState.user._id = "testUserId";
    authState.user.id = "testUserId";
    authState.user.role = "user";
    authState.user.cv = "cv/owned.pdf";
    t = convexTest(schema, modules);

    jobId = await t.mutation(api.jobs.mutations.createJob, {
      title: "Job Title",
      description: "Job Description",
      company: "Job Company",
      location: { lat: 0, lng: 0 },
      salary: 0,
      salaryPeriod: "hour",
      type: "job",
      contractType: "fullTime",
      city: "City",
      duration: "Duration",
      startDate: "2022-01-01",
      certificates: [],
    });

    const job = await t.run(async (ctx) => await ctx.db.get(jobId));
    jobSlug = job!.slug;
  });

  async function submitApplication(args: {
    jobId: Id<"JobOffer">;
    applicationCvKey?: string;
  }) {
    return await t.mutation(internal.jobs.mutations.submitApplication, {
      ...args,
      candidateId: authState.user._id,
      profileCv: authState.user.cv ?? undefined,
    });
  }

  it("should have created a job", async () => {
    const result = await t.query(api.jobs.queries.getJobWithContact, {
      slug: jobSlug,
    });
    expect(result?.title).toBe("Job Title");
  });

  it("should update a job", async () => {
    await t.mutation(api.jobs.mutations.updateJob, {
      id: jobId,
      title: "Updated Job Title",
      description: "Job Description",
      company: "Job Company",
      location: { lat: 0, lng: 0 },
      salary: 0,
      salaryPeriod: "hour",
      type: "job",
      contractType: "fullTime",
      city: "City",
      duration: "Duration",
      startDate: "2022-01-01",
      certificates: [],
    });

    const result = await t.query(api.jobs.queries.getJobWithContact, {
      slug: jobSlug,
    });
    expect(result?.title).toBe("Updated Job Title");
  });

  it("should delete a job", async () => {
    await t.mutation(api.jobs.mutations.deleteJob, {
      id: jobId,
    });

    const result = await t.query(api.jobs.queries.getJobWithContact, {
      slug: jobSlug,
    });
    expect(result?.status).toBe("archived");
  });

  it("archives a job without deleting its associated records", async () => {
    const descendants = await t.run(async (ctx) => {
      const translationId = await ctx.db.insert("jobTranslations", {
        jobId,
        language: "en",
        title: "Translation",
        city: "City",
        description: "Description",
        sourceUpdatedAt: Date.now(),
      });
      const contactId = await ctx.db.insert("JobContactInfo", {
        jobId,
        email: "owner@example.com",
      });
      const bookmarkId = await ctx.db.insert("bookmarks", {
        userId: "bookmark-owner",
        resourceId: jobId,
        resourceType: "job",
      });
      return { translationId, contactId, bookmarkId };
    });

    await t.mutation(api.jobs.mutations.deleteJob, { id: jobId });

    await t.run(async (ctx) => {
      expect((await ctx.db.get(jobId))?.status).toBe("archived");
      for (const id of Object.values(descendants)) {
        expect(await ctx.db.get(id)).not.toBeNull();
      }
    });
  });

  it("hides archived jobs from other members", async () => {
    await t.mutation(api.jobs.mutations.deleteJob, { id: jobId });
    authState.user._id = "anotherUserId";
    authState.user.id = "anotherUserId";

    await expect(
      t.query(api.jobs.queries.getJobWithContact, { slug: jobSlug }),
    ).resolves.toBeNull();
  });

  it("should refuse deletion by another authenticated user", async () => {
    authState.user._id = "anotherUserId";
    authState.user.id = "anotherUserId";

    await expect(
      t.mutation(api.jobs.mutations.deleteJob, { id: jobId }),
    ).rejects.toThrow("Not allowed to delete this job");

    const job = await t.run(async (ctx) => await ctx.db.get(jobId));
    expect(job).not.toBeNull();
  });

  it("refuses a second application from the same candidate", async () => {
    authState.user._id = "candidateId";
    authState.user.id = "candidateId";

    await submitApplication({ jobId });

    await expect(
      submitApplication({ jobId }),
    ).rejects.toThrow("You have already applied to this job");
  });

  it("only reports an application to its candidate", async () => {
    authState.user._id = "candidateId";
    authState.user.id = "candidateId";
    await submitApplication({ jobId });

    await expect(
      t.query(api.jobs.queries.hasCurrentUserAppliedToJob, { jobId }),
    ).resolves.toBe("pending");
  });

  it("uses an application CV without changing the profile CV", async () => {
    authState.user._id = "candidateId";
    authState.user.id = "candidateId";
    const profileCv = authState.user.cv;

    await t.run(async (ctx) => {
      await ctx.db.insert("uploadGrants", {
        key: "applicationCv/candidate.pdf",
        userId: "candidateId",
        kind: "applicationCv",
        expectedContentType: "application/pdf",
        maxSize: 5 * 1024 * 1024,
        verified: true,
      });
    });

    await submitApplication({
      jobId,
      applicationCvKey: "applicationCv/candidate.pdf",
    });

    await t.run(async (ctx) => {
      const application = (await ctx.db.query("jobApplications").collect()).find(
        (entry) =>
          entry.jobId === jobId && entry.candidateId === "candidateId",
      );
      expect(application?.cvKey).toBe("applicationCv/candidate.pdf");
    });
    expect(authState.user.cv).toBe(profileCv);
  });

  it("refuses an application CV that was not verified for the candidate", async () => {
    authState.user._id = "candidateId";
    authState.user.id = "candidateId";

    await expect(
      submitApplication({
        jobId,
        applicationCvKey: "applicationCv/not-owned.pdf",
      }),
    ).rejects.toThrow("Upload key is not verified for the current user");
  });

  it("refuses an application when the offer is closed", async () => {
    await t.mutation(api.jobs.mutations.setJobStatus, {
      id: jobId,
      status: "closed",
    });
    authState.user._id = "candidateId";
    authState.user.id = "candidateId";

    await expect(
      submitApplication({ jobId }),
    ).rejects.toThrow("This job is no longer accepting applications");
  });

  it("does not include closed offers in the public list", async () => {
    await t.mutation(api.jobs.mutations.setJobStatus, {
      id: jobId,
      status: "closed",
    });

    const result = await t.query(api.jobs.queries.getJobs, {
      paginationOpts: { cursor: null, numItems: 10 },
    });

    expect(result.page.some((job) => job._id === jobId)).toBe(false);
  });

  it("does not allow the generic profile mutation to replace the CV key", async () => {
    await expect(
      t.mutation(
        api.auth.users.updateUser,
        { patch: { cv: "cv/another-user.pdf" } } as never,
      ),
    ).rejects.toThrow();
  });
});
