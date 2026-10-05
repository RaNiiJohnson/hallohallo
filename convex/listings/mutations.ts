import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { authMutation } from "../functions";
import {
  assertVerifiedUpload,
  consumeUploadGrant,
  r2,
} from "../integrations/r2";
import {
  throwForbidden,
  throwNotFound,
  throwValidationError,
} from "../utils/errors";

const imageValidator = v.object({
  storageId: v.optional(v.string()),
  url: v.optional(v.string()),
  publicId: v.optional(v.string()),
  secureUrl: v.optional(v.string()),
});

const contactValidator = v.object({
  phone: v.optional(v.string()),
  email: v.optional(v.string()),
});

type ListingContactInput = {
  phone?: string;
  email?: string;
};

function normalizeContact(contact: ListingContactInput | undefined) {
  const phone = contact?.phone?.trim() || undefined;
  const email = contact?.email?.trim().toLowerCase() || undefined;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throwValidationError("Invalid contact email");
  }
  if (phone && !/^\+?[0-9 ()-]{6,30}$/.test(phone)) {
    throwValidationError("Invalid contact phone number");
  }

  return { phone, email };
}

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
    contact: v.optional(contactValidator),
  },
  returns: v.id("RealestateListing"),
  handler: async (ctx, args) => {
    const user = ctx.user;
    const { contact, ...listingArgs } = args;
    const normalizedContact = normalizeContact(contact);

    if (user.userType !== "provider" && user.role !== "admin") {
      throwForbidden("Only providers or admins can publish listings");
    }

    const uploadedKeys = args.images.flatMap((image) =>
      image.storageId ? [image.storageId] : [],
    );
    for (const key of new Set(uploadedKeys)) {
      await assertVerifiedUpload(ctx, {
        key,
        userId: user._id,
        kind: "listing",
      });
    }

    const searchAllContent = `${args.title} ${args.propertyType} ${args.listingMode} ${args.city} ${args.description}`;

    const listingId = await ctx.db.insert("RealestateListing", {
      ...listingArgs,
      slug: generatedSlug(args.title),
      authorId: user._id,
      authorName: user.name,
      updatedAt: Date.now(),
      searchAll: searchAllContent,
      currency: "EUR",
    });

    for (const key of new Set(uploadedKeys)) {
      await consumeUploadGrant(ctx, key);
    }

    if (normalizedContact.phone || normalizedContact.email) {
      await ctx.db.insert("RealestateContactInfo", {
        listingId,
        listing: args.title,
        ...normalizedContact,
      });
    }

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
  returns: v.null(),
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
    const contact = await ctx.db
      .query("RealestateContactInfo")
      .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
      .unique();
    if (contact) await ctx.db.delete(contact._id);

    const translations = await ctx.db
      .query("listingTranslations")
      .withIndex("by_listing", (q) => q.eq("listingId", listingId))
      .collect();
    await Promise.all(translations.map((t) => ctx.db.delete(t._id)));

    // 3. Deletes the bookmarks pointing to this listing.
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_resourceId", (q) => q.eq("resourceId", listingId))
      .collect();
    await Promise.all(bookmarks.map((b) => ctx.db.delete(b._id)));

    // 4. Deletes the ad itself
    await ctx.db.delete(listingId);
    return null;
  },
});

export const updateListing = authMutation({
  args: {
    listingId: v.id("RealestateListing"),
    contact: v.optional(contactValidator),
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
      location: v.optional(
        v.union(v.object({ lat: v.number(), lng: v.number() }), v.null()),
      ),
      city: v.optional(v.string()),
      price: v.optional(v.number()),
      charges: v.optional(v.union(v.number(), v.null())),
      deposit: v.optional(v.union(v.number(), v.null())),
      period: v.optional(v.literal("month")),
      area: v.optional(v.number()),
      bedrooms: v.optional(v.number()),
      bathrooms: v.optional(v.number()),
      floor: v.optional(v.number()),
      pets: v.optional(v.boolean()),
      images: v.optional(v.array(imageValidator)),
      description: v.optional(v.string()),
      extras: v.optional(v.array(v.string())),
      availableFrom: v.optional(v.union(v.number(), v.null())),
    }),
  },
  returns: v.null(),
  handler: async (ctx, { listingId, patch, contact }) => {
    const listing = await ctx.db.get(listingId);
    if (!listing) throwNotFound("Listing not found");

    const isOwner = listing.authorId === ctx.user._id;
    const isAdmin = ctx.user.role === "admin";
    if (!isOwner && !isAdmin) {
      throwForbidden("Not allowed to update this listing");
    }

    const { location, charges, deposit, availableFrom, ...otherFields } = patch;
    const normalizedPatch = {
      ...otherFields,
      ...(location !== undefined ? { location: location ?? undefined } : {}),
      ...(charges !== undefined ? { charges: charges ?? undefined } : {}),
      ...(deposit !== undefined ? { deposit: deposit ?? undefined } : {}),
      ...(availableFrom !== undefined
        ? { availableFrom: availableFrom ?? undefined }
        : {}),
    };

    if (normalizedPatch.images) {
      const oldKeys = new Set(
        (listing.images ?? [])
          .filter((img) => img.storageId)
          .map((img) => img.storageId!),
      );
      const newKeys = new Set(
        normalizedPatch.images
          .filter((img) => img.storageId)
          .map((img) => img.storageId!),
      );
      const removedKeys = [...oldKeys].filter((k) => !newKeys.has(k));
      const addedKeys = [...newKeys].filter((k) => !oldKeys.has(k));

      for (const key of addedKeys) {
        await assertVerifiedUpload(ctx, {
          key,
          userId: ctx.user._id,
          kind: "listing",
        });
      }

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

      for (const key of addedKeys) {
        await consumeUploadGrant(ctx, key);
      }
    }

    const updatedListing = { ...listing, ...normalizedPatch };
    const searchAllContent = `${updatedListing.title} ${updatedListing.propertyType} ${updatedListing.city} ${updatedListing.listingMode} ${updatedListing.description}`;

    await ctx.db.patch(listingId, {
      ...normalizedPatch,
      searchAll: searchAllContent,
      updatedAt: Date.now(),
    });

    const existingContact = await ctx.db
      .query("RealestateContactInfo")
      .withIndex("by_listingId", (q) => q.eq("listingId", listingId))
      .unique();

    if (contact !== undefined) {
      const normalizedContact = normalizeContact(contact);
      if (!normalizedContact.phone && !normalizedContact.email) {
        if (existingContact) await ctx.db.delete(existingContact._id);
      } else if (existingContact) {
        await ctx.db.patch(existingContact._id, {
          ...normalizedContact,
          listing: updatedListing.title,
        });
      } else {
        await ctx.db.insert("RealestateContactInfo", {
          listingId,
          listing: updatedListing.title,
          ...normalizedContact,
        });
      }
    } else if (existingContact && patch.title !== undefined) {
      await ctx.db.patch(existingContact._id, {
        listing: updatedListing.title,
      });
    }
    return null;
  },
});
