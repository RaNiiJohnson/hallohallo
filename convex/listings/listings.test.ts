/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { authComponent, requireAuth } from "../auth/auth";
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
    vi.mocked(requireAuth).mockResolvedValue({
      user: {
        _id: "testUserId",
        id: "testUserId",
        name: "Test User",
        userType: "provider",
      },
    } as never);
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
      contact: { email: "provider@example.com" },
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
        availableFrom: 1_800_000_000_000,
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
    expect(result?.contactVerificationRequired).toBe(true);
    expect(result?.location).toEqual({ lat: 52.52, lng: 13.41 });

    vi.mocked(authComponent.safeGetAuthUser).mockResolvedValue(null as never);
    const anonymousResult = await t.query(
      api.listings.queries.getListingWithContact,
      { slug: listing!.slug },
    );
    expect(anonymousResult?.contact).toBeNull();
    expect(anonymousResult?.location).toEqual({ lat: 52.52, lng: 13.41 });
    expect(anonymousResult?.contactAccessRequired).toBe(true);
    expect(anonymousResult?.contactVerificationRequired).toBe(false);

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
        limit: 1,
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
    expect(verifiedResult?.location).toEqual({ lat: 52.52, lng: 13.41 });
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

  it("requires an email address or WhatsApp number for a new listing", async () => {
    await expect(
      t.mutation(api.listings.mutations.createListing, {
        title: "No contact listing",
        propertyType: "studio",
        listingMode: "rent",
        city: "Berlin",
        price: 900,
        availableFrom: 1_800_000_000_000,
        area: 30,
        bedrooms: 1,
        bathrooms: 1,
        floor: 2,
        pets: false,
        images: [],
        description: "A listing that intentionally omits contact details",
        extras: [],
      }),
    ).rejects.toThrow("An email address or WhatsApp phone number is required");
  });

  it("rejects contact details and precise locations in public listing text", async () => {
    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: { description: "Write to owner@example.com or call +49 151 23456789" },
      }),
    ).rejects.toThrow("Public listing text must not include contact details");

    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: { description: "Exact position: 52.5200, 13.4050" },
      }),
    ).rejects.toThrow("Public listing text must not include contact details");

    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: { neighborhood: "Hauptstraße 42" },
      }),
    ).rejects.toThrow("Public listing text must not include contact details");
  });

  it("upserts contact details and prevents removing the last contact method", async () => {
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

    await expect(
      t.mutation(api.listings.mutations.updateListing, {
        listingId,
        patch: {},
        contact: {},
      }),
    ).rejects.toThrow("An email address or WhatsApp phone number is required");
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

  it("keeps rental deposits out of listings for sale", async () => {
    const saleListingId = await t.mutation(api.listings.mutations.createListing, {
      title: "Listing for sale",
      propertyType: "house",
      listingMode: "sale",
      city: "Munich",
      price: 450_000,
      charges: 200,
      deposit: 3_000,
      availableFrom: 1_800_000_000_000,
      area: 100,
      bedrooms: 4,
      bathrooms: 2,
      floor: 0,
      pets: true,
      images: [],
      description: "A house offered for sale",
      extras: [],
      contact: { phone: "+49 151 23456789" },
    });

    await t.mutation(api.listings.mutations.updateListing, {
      listingId,
      patch: {
        listingMode: "sale",
        charges: 150,
        deposit: 2_000,
        availableFrom: 1_800_000_000_000,
      },
    });

    await t.run(async (ctx) => {
      const saleListing = await ctx.db.get(saleListingId);
      const convertedListing = await ctx.db.get(listingId);

      expect(saleListing?.deposit).toBeUndefined();
      expect(saleListing?.charges).toBe(200);
      expect(saleListing?.availableFrom).toBe(1_800_000_000_000);
      expect(convertedListing?.deposit).toBeUndefined();
      expect(convertedListing?.charges).toBe(150);
      expect(convertedListing?.availableFrom).toBe(1_800_000_000_000);
    });
  });

  it("keeps a closed listing accessible but out of public results", async () => {
    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "closed",
    });

    await expect(
      t.query(api.listings.queries.getListingWithContact, { slug: listingSlug }),
    ).resolves.toMatchObject({ status: "closed" });

    const results = await t.query(api.listings.queries.getListing, {
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(results.page.map((listing) => listing._id)).not.toContain(listingId);

    const cityResults = await t.query(
      api.listings.queries.listListingsByCity,
      { city: "City" },
    );
    expect(cityResults.map((listing) => listing._id)).not.toContain(listingId);
  });

  it("archives a listing without deleting its associated records", async () => {
    const descendants = await t.run(async (ctx) => {
      const translationId = await ctx.db.insert("listingTranslations", {
        listingId,
        language: "en",
        title: "Translation",
        city: "City",
        description: "Description",
        sourceUpdatedAt: Date.now(),
      });
      const contactId = await ctx.db.insert("RealestateContactInfo", {
        listingId,
        listing: "Listing Title",
        email: "owner@example.com",
      });
      const bookmarkId = await ctx.db.insert("bookmarks", {
        userId: "bookmark-owner",
        resourceId: listingId,
        resourceType: "realEstate",
      });
      return { translationId, contactId, bookmarkId };
    });

    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "closed",
    });
    await t.mutation(api.listings.mutations.archiveListing, { listingId });

    await t.run(async (ctx) => {
      expect((await ctx.db.get(listingId))?.status).toBe("archived");
      for (const id of Object.values(descendants)) {
        expect(await ctx.db.get(id)).not.toBeNull();
      }
    });
  });

  it("hides archived listings from other members", async () => {
    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "closed",
    });
    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "archived",
    });
    vi.mocked(authComponent.safeGetAuthUser).mockResolvedValue({
      _id: "anotherUserId",
      emailVerified: true,
    } as never);

    await expect(
      t.query(api.listings.queries.getListingWithContact, { slug: listingSlug }),
    ).resolves.toBeNull();
    await expect(
      t.query(api.listings.queries.getListingMetadata, { slug: listingSlug }),
    ).resolves.toBeNull();
  });

  it("enforces the active, closed, archived lifecycle on the server", async () => {
    await expect(
      t.mutation(api.listings.mutations.setListingStatus, {
        listingId,
        status: "archived",
      }),
    ).rejects.toThrow("Invalid listing status transition");

    await expect(
      t.mutation(api.listings.mutations.archiveListing, { listingId }),
    ).rejects.toThrow("Listing must be closed before it can be archived");

    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "closed",
    });
    await t.mutation(api.listings.mutations.setListingStatus, {
      listingId,
      status: "archived",
    });
    await expect(
      t.mutation(api.listings.mutations.setListingStatus, {
        listingId,
        status: "active",
      }),
    ).rejects.toThrow("Invalid listing status transition");

    expect((await t.run((ctx) => ctx.db.get(listingId)))?.status).toBe("archived");
  });

  it("refuses lifecycle changes by another member", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      user: { _id: "anotherUserId", role: "user" },
    } as never);

    await expect(
      t.mutation(api.listings.mutations.setListingStatus, {
        listingId,
        status: "closed",
      }),
    ).rejects.toThrow("Not allowed to change this listing status");
  });
});
