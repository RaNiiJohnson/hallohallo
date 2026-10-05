/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
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
      safeGetAuthUser: vi.fn().mockResolvedValue({
        _id: "testUserId",
        name: "Test User",
        userType: "provider",
      }),
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
    expect(result).toBeNull();
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

  it("does not accept a client-provided CV key", async () => {
    await expect(
      t.action(
        api.jobs.actions.applyToJob,
        {
          jobId,
          cvStorageId: "cv/another-user.pdf",
        } as never,
      ),
    ).rejects.toThrow();
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
