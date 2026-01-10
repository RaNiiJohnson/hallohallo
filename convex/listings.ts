// convex/listings.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getListingWithContact = query({
  args: { listingId: v.id("RealestateListing") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;

    // Récupération des informations de contact via l'index
    const contact = await ctx.db
      .query("RealestateContactInfo")
      .withIndex("by_listingId", (q) => q.eq("listingId", args.listingId))
      .unique(); // Utilise .unique() si une annonce n'a qu'un seul bloc de contact

    return {
      ...listing,
      contact,
    };
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
      })
    );
  },
});
