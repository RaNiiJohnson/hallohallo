import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { authMutation } from "../functions";
import { r2 } from "../integrations/r2";
import { throwForbidden, throwNotFound } from "../utils/errors";

const imageValidator = v.object({
  storageId: v.optional(v.string()),
  url: v.optional(v.string()),
  publicId: v.optional(v.string()),
  secureUrl: v.optional(v.string()),
});

export const createListing = authMutation({
  args: {
    title: v.string(),
    propertyType: v.union(
      v.literal("room"),
      v.literal("apartment"),
      v.literal("house"),
      v.literal("studio"),
      v.literal("shared"),
    ),
    listingMode: v.union(v.literal("rent"), v.literal("sale")),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    city: v.string(),
    price: v.number(),

    charges: v.optional(v.number()),
    deposit: v.optional(v.number()),
    area: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    floor: v.number(),
    pets: v.boolean(),
    images: v.array(
      v.object({
        storageId: v.optional(v.string()),
        url: v.optional(v.string()),
        publicId: v.optional(v.string()),
        secureUrl: v.optional(v.string()),
      }),
    ),
    description: v.string(),
    extras: v.array(v.string()),
    availableFrom: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = ctx.user;

    const searchAllContent = `${args.title} ${args.propertyType} ${args.listingMode} ${args.city} ${args.description}`;

    const listingId = await ctx.db.insert("RealestateListing", {
      ...args,
      slug: generatedSlug(args.title),
      authorId: user._id,
      authorName: user.name,
      updatedAt: Date.now(),
      searchAll: searchAllContent,
      currency: "EUR",
    });

    // await posthog.capture(ctx, {
    //   distinctId: posthogDistinctId(user._id),
    //   event: "listing_created",
    //   properties: {
    //     listing_id: listingId,
    //     property_type: args.propertyType,
    //     listing_mode: args.listingMode,
    //     city: args.city,
    //     price: args.price,
    //   },
    // });

    return listingId;
  },
});

export const deleteListing = authMutation({
  args: { listingId: v.id("RealestateListing") },
  handler: async (ctx, { listingId }) => {
    const listing = await ctx.db.get(listingId);
    if (!listing) throwNotFound("Listing not found");

    const isOwner = listing.authorId === ctx.user._id;
    const isAdmin = ctx.user.role === "admin";
    if (!isOwner && !isAdmin) {
      throwForbidden("Not allowed to delete this listing");
    }

    // 1. Deletes R2 images (ignores legacy Cloudinary entries without a storageId)
    const results = await Promise.allSettled(
      (listing.images ?? [])
        .filter((img) => img.storageId)
        .map((img) => r2.deleteObject(ctx, img.storageId!)),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(
        `deleteListing ${listingId}: ${failed.length} image(s) R2 non supprimée(s)`,
        failed,
      );
      // We'll proceed anyway: better an orphaned listing without an image
      // than an orphaned image without a listing—which would be impossible to find.
    }

    // 2. Deletes the linked contact
    // const contact = await ctx.db
    //   .query("RealestateContactInfo")
    //   .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
    //   .unique();
    // if (contact) await ctx.db.delete(contact._id);

    // 3. Deletes the bookmarks pointing to this listing.
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_resourceId", (q) => q.eq("resourceId", listingId))
      .collect();
    await Promise.all(bookmarks.map((b) => ctx.db.delete(b._id)));

    // 4. Deletes the ad itself
    await ctx.db.delete(listingId);
  },
});

export const updateListing = authMutation({
  args: {
    listingId: v.id("RealestateListing"),
    patch: v.object({
      title: v.optional(v.string()),
      propertyType: v.optional(
        v.union(
          v.literal("room"),
          v.literal("apartment"),
          v.literal("house"),
          v.literal("studio"),
          v.literal("shared"),
        ),
      ),
      listingMode: v.optional(v.union(v.literal("rent"), v.literal("sale"))),
      location: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      city: v.optional(v.string()),
      price: v.optional(v.number()),
      charges: v.optional(v.number()),
      deposit: v.optional(v.number()),
      period: v.optional(v.literal("month")),
      area: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      floor: v.optional(v.number()),
      pets: v.optional(v.boolean()),
      images: v.optional(v.array(imageValidator)),
      description: v.optional(v.string()),
      extras: v.optional(v.array(v.string())),
      availableFrom: v.optional(v.number()),
    }),
  },
  handler: async (ctx, { listingId, patch }) => {
    const listing = await ctx.db.get(listingId);
    if (!listing) throwNotFound("Listing not found");

    const isOwner = listing.authorId === ctx.user._id;
    const isAdmin = ctx.user.role === "admin";
    if (!isOwner && !isAdmin) {
      throwForbidden("Not allowed to update this listing");
    }

    if (patch.images) {
      const oldKeys = new Set(
        (listing.images ?? [])
          .filter((img) => img.storageId)
          .map((img) => img.storageId!),
      );
      const newKeys = new Set(
        patch.images
          .filter((img) => img.storageId)
          .map((img) => img.storageId!),
      );
      const removedKeys = [...oldKeys].filter((k) => !newKeys.has(k));

      const results = await Promise.allSettled(
        removedKeys.map((key) => r2.deleteObject(ctx, key)),
      );
      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        console.error(
          `updateListing ${listingId}: ${failed.length} ancienne(s) image(s) R2 non supprimée(s)`,
          failed,
        );
      }
    }

    const searchAllContent = `${patch.title} ${patch.propertyType} ${patch.city} ${patch.listingMode} ${patch.description}`;

    await ctx.db.patch(listingId, { ...patch, searchAll: searchAllContent });
  },
});
