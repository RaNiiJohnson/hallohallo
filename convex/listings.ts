// convex/listings.ts
import {
  OrderedQuery,
  paginationOptsValidator,
  Query,
  QueryInitializer,
} from "convex/server";
import { DataModel, Id } from "./_generated/dataModel";
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

export const getListingMetadata = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(
      "RealestateListing",
      args.id as Id<"RealestateListing">,
    );

    return listing;
  },
});

export const getListing = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    type: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { searchTerm, type, bedrooms, minPrice, maxPrice } = args;

    // Étape 1 : table
    const tableQuery: QueryInitializer<DataModel["RealestateListing"]> =
      ctx.db.query("RealestateListing");

    let orderedQuery: OrderedQuery<DataModel["RealestateListing"]>;

    if (searchTerm && searchTerm.trim() !== "") {
      // Étape 2+3 : search index (inclut déjà l’ordre)
      orderedQuery = tableQuery.withSearchIndex("search_all_fields", (q) => {
        let search = q.search("searchAll", searchTerm);
        if (type && type !== "all") search = search.eq("type", type);
        if (bedrooms && bedrooms > 0) search = search.eq("bedrooms", bedrooms);
        return search;
      });
    } else {
      // Étape 2 : index normal ou pas d’index
      let indexedQuery: Query<DataModel["RealestateListing"]> = tableQuery;
      if (type && type !== "all") {
        indexedQuery = tableQuery.withIndex("by_type", (q) =>
          q.eq("type", type),
        );
      }

      // Étape 3 : ordre
      orderedQuery = indexedQuery.order("desc");
    }

    // Étape 4 : filtres supplémentaires
    const filtered = orderedQuery.filter((q) => {
      let expr = q.eq(q.field("_id"), q.field("_id")); // toujours vrai

      if (minPrice !== undefined) {
        expr = q.and(expr, q.gte(q.field("priceNumeric"), minPrice));
      }
      if (maxPrice !== undefined) {
        expr = q.and(expr, q.lte(q.field("priceNumeric"), maxPrice));
      }
      if (!searchTerm && bedrooms && bedrooms > 0) {
        expr = q.and(expr, q.eq(q.field("bedrooms"), bedrooms));
      }

      return expr;
    });

    // Étape 5 : pagination
    return filtered.paginate(args.paginationOpts);
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
