/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";
import { Id } from "../_generated/dataModel";

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
  return {
    ...actual,
    authComponent: {
      ...actual.authComponent,
      safeGetAuthUser: vi.fn().mockResolvedValue({
        _id: "testUserId",
        name: "Test User",
      }),
    },
  };
});

describe("Jobs", () => {
  let t: ReturnType<typeof convexTest>;
  let jobId: Id<"JobOffer">;
  let jobSlug: string;

  beforeEach(async () => {
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
});
