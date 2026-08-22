import { v } from "convex/values";
import { generatedSlug } from "../../src/lib/utils";
import { mutation } from "../_generated/server";
import { authComponent } from "../auth/auth";
import { posthog, posthogDistinctId } from "../integrations/posthog";

export const createListing = mutation({
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
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

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

    await posthog.capture(ctx, {
      distinctId: posthogDistinctId(user._id),
      event: "listing_created",
      properties: {
        listing_id: listingId,
        property_type: args.propertyType,
        listing_mode: args.listingMode,
        city: args.city,
        price: args.price,
      },
    });

    return listingId;
  },
});
