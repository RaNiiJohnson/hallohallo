/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";

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

describe("createJob", () => {
  it("should create a job", async () => {
    const t = convexTest(schema, modules).withIdentity({
      subject: "test_user",
      name: "Test User",
    });
    await t.mutation(api.jobs.mutations.createJob, {
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
    await t.mutation(api.jobs.mutations.createJob, {
      title: "Job Title 2",
      description: "Job Description 2",
      company: "Job Company 2",
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

    const result = await t.query(api.jobs.queries.getJobs, {
      paginationOpts: { numItems: 10, cursor: null },
    });
    expect(result.page).toHaveLength(2);
    expect(result.page[0].title).toBe("Job Title 2");
    expect(result.page[1].title).toBe("Job Title");
  });
});
