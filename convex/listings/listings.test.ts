/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue({
      user: {
        _id: "testUserId",
        id: "testUserId",
        name: "Test User",
        userType: "provider",
      },
    }),
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

describe("Listings", () => {
  let t: ReturnType<typeof convexTest>;
  let listingId: Id<"RealestateListing">;
  let listingSlug: string;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    listingId = await t.mutation(api.listings.mutations.createListing, {
      title: "Listing Title",
      propertyType: "apartment",
      listingMode: "rent",
      location: { lat: 0, lng: 0 },
      city: "City",
      price: 1000,
      charges: 100,
      deposit: 2000,
      area: 50,
      bedrooms: 2,
      bathrooms: 1,
      floor: 1,
      pets: false,
      images: [],
      description: "Listing Description",
      extras: [],
      availableFrom: 1_800_000_000_000,
    });

    const listing = await t.run(async (ctx) => await ctx.db.get(listingId));
    listingSlug = listing!.slug;
  });

  it("should have created a listing", async () => {
    const result = await t.query(api.listings.queries.getListingWithContact, {
      slug: listingSlug,
    });
    expect(result?.title).toBe("Listing Title");
  });

  it("updates a listing and clears optional fields", async () => {
    await t.mutation(api.listings.mutations.updateListing, {
      listingId,
      patch: {
        title: "Updated Listing",
        location: null,
        charges: null,
        deposit: null,
        availableFrom: null,
      },
    });

    const listing = await t.run(async (ctx) => await ctx.db.get(listingId));

    expect(listing?.title).toBe("Updated Listing");
    expect(listing?.location).toBeUndefined();
    expect(listing?.charges).toBeUndefined();
    expect(listing?.deposit).toBeUndefined();
    expect(listing?.availableFrom).toBeUndefined();
    expect(listing?.searchAll).toContain("Updated Listing");
  });

  it("deletes a listing", async () => {
    await t.mutation(api.listings.mutations.deleteListing, { listingId });

    const listing = await t.run(async (ctx) => await ctx.db.get(listingId));
    expect(listing).toBeNull();
  });
});
