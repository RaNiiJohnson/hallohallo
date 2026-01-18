// convex/listings.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getListingWithContact = query({
  args: { id: v.id("RealestateListing") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get("RealestateListing", args.id);
    if (!listing) return null;

    // Récupération des informations de contact via l'index
    const contact = await ctx.db
      .query("RealestateContactInfo")
      .withIndex("by_listingId", (q) => q.eq("listingId", args.id))
      .unique(); // Utilise .unique() si une annonce n'a qu'un seul bloc de contact

    return {
      ...listing,
      contact,
    };
  },
});

export const getListing = query({
  args: {},
  handler: async (ctx) => {
    const listing = await ctx.db
      .query("RealestateListing")
      .order("desc")
      .collect();

    return listing;
  },
});

export const listListingsByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("RealestateListing")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .collect();

    return Promise.all(
      listings.map(async (listing) => {
        const contact = await ctx.db
          .query("RealestateContactInfo")
          .withIndex("by_listingId", (q) => q.eq("listingId", listing._id))
          .unique();
        return { ...listing, contact };
      }),
    );
  },
});

export const getSimilarRealEstateListings = query({
  args: {
    excludeId: v.id("RealestateListing"),
    city: v.string(),
    type: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const byCity = await ctx.db
      .query("RealestateListing")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .filter((q) => q.neq(q.field("_id"), args.excludeId))
      .order("desc")
      .take(args.limit);

    if (byCity.length >= args.limit) return byCity;

    const remaining = args.limit - byCity.length;

    const byType = await ctx.db
      .query("RealestateListing")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) =>
        q.and(
          q.neq(q.field("_id"), args.excludeId),
          q.neq(q.field("city"), args.city), // éviter les doublons ville déjà pris
        ),
      )
      .order("desc")
      .take(remaining);

    return [...byCity, ...byType];
  },
});
