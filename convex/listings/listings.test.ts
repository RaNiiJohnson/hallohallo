/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { authComponent } from "../auth/auth";
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
    vi.mocked(authComponent.safeGetAuthUser).mockResolvedValue({
      _id: "testUserId",
      emailVerified: false,
    } as never);
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
    expect(result?.contact).toBeNull();
    expect(result?.location).toBeUndefined();
  });

  it("keeps contact details and precise coordinates out of public responses", async () => {
    const contactListingId = await t.mutation(
      api.listings.mutations.createListing,
      {
        title: "Contact Listing",
        propertyType: "studio",
        listingMode: "rent",
        city: "Berlin",
        location: { lat: 52.52, lng: 13.405 },
        price: 900,
        area: 30,
        bedrooms: 1,
        bathrooms: 1,
        floor: 2,
        pets: false,
        images: [],
        description: "A listing with contact details",
        extras: [],
        contact: {
          phone: "+49 151 23456789",
          email: "Owner@Example.com",
        },
      },
    );
    const listing = await t.run(async (ctx) =>
      await ctx.db.get(contactListingId),
    );

    const result = await t.query(api.listings.queries.getListingWithContact, {
      slug: listing!.slug,
    });
    expect(result?.contact).toBeNull();
    expect(result?.contactAccessRequired).toBe(true);
    expect(result?.location).toBeUndefined();

    const cityResults = await t.query(
      api.listings.queries.listListingsByCity,
      { city: "Berlin" },
    );
    expect(cityResults[0]).not.toHaveProperty("contact");
    expect(cityResults[0]).not.toHaveProperty("location");

    const metadata = await t.query(api.listings.queries.getListingMetadata, {
      slug: listing!.slug,
    });
    expect(metadata).not.toHaveProperty("location");

    const paginatedResults = await t.query(api.listings.queries.getListing, {
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(paginatedResults.page[0]).not.toHaveProperty("location");

    const similarResults = await t.query(
      api.listings.queries.getSimilarRealEstateListings,
      {
        excludeSlug: listingSlug,
        city: "Berlin",
        propertyType: "studio",
        limit: 5,
      },
    );
    expect(similarResults[0]).not.toHaveProperty("location");

    vi.mocked(authComponent.safeGetAuthUser).mockResolvedValue({
      _id: "verifiedUserId",
      emailVerified: true,
    } as never);

    const verifiedResult = await t.query(
      api.listings.queries.getListingWithContact,
      { slug: listing!.slug },
    );
    expect(verifiedResult?.contact).toMatchObject({
      phone: "+49 151 23456789",
      email: "owner@example.com",
    });
    expect(verifiedResult?.location).toMatchObject({
      lat: 52.52,
      lng: 13.405,
    });
  });

  it("rejects malformed contact details", async () => {
    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: {},
        contact: { email: "not-an-email" },
      }),
    ).rejects.toThrow("Invalid contact email");

    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: {},
        contact: { phone: "call-me" },
      }),
    ).rejects.toThrow("Invalid contact phone number");
  });

  it("upserts and removes contact details while keeping legacy listings valid", async () => {
    await t.mutation(api.listings.mutations.updateListing, {
      listingId,
      patch: {},
      contact: { email: "owner@example.com" },
    });
    expect(
      (
        await t.query(api.listings.queries.getListingWithContact, {
          slug: listingSlug,
        })
      )?.contact?.email,
    ).toBeUndefined();

    await t.mutation(api.listings.mutations.updateListing, {
      listingId,
      patch: {},
      contact: {},
    });
    expect(
      (
        await t.query(api.listings.queries.getListingWithContact, {
          slug: listingSlug,
        })
      )?.contact,
    ).toBeNull();
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
