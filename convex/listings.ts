import { generatedSlug } from "./../src/lib/utils";
// convex/listings.ts
import {
  OrderedQuery,
  paginationOptsValidator,
  Query,
  QueryInitializer,
} from "convex/server";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

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
    propertyType: v.optional(
      v.union(
        v.literal("room"),
        v.literal("apartment"),
        v.literal("house"),
        v.literal("studio"),
        v.literal("shared"),
      ),
    ),
    bedrooms: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { searchTerm, propertyType, bedrooms, minPrice, maxPrice } = args;

    // Étape 1 : table
    const tableQuery: QueryInitializer<DataModel["RealestateListing"]> =
      ctx.db.query("RealestateListing");

    let orderedQuery: OrderedQuery<DataModel["RealestateListing"]>;

    if (searchTerm && searchTerm.trim() !== "") {
      // Étape 2+3 : search index (inclut déjà l’ordre)
      orderedQuery = tableQuery.withSearchIndex("search_all_fields", (q) => {
        let search = q.search("searchAll", searchTerm);
        if (propertyType) search = search.eq("propertyType", propertyType);
        if (bedrooms && bedrooms > 0) search = search.eq("bedrooms", bedrooms);
        return search;
      });
    } else {
      // Étape 2 : index normal ou pas d’index
      let indexedQuery: Query<DataModel["RealestateListing"]> = tableQuery;
      if (propertyType) {
        indexedQuery = tableQuery.withIndex("by_propertyType", (q) =>
          q.eq("propertyType", propertyType),
        );
      }

      // Étape 3 : ordre
      orderedQuery = indexedQuery.order("desc");
    }

    // Étape 4 : filtres supplémentaires
    const filtered = orderedQuery.filter((q) => {
      let expr = q.eq(q.field("_id"), q.field("_id")); // toujours vrai

      if (minPrice !== undefined) {
        expr = q.and(expr, q.gte(q.field("price"), minPrice));
      }
      if (maxPrice !== undefined) {
        expr = q.and(expr, q.lte(q.field("price"), maxPrice));
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
    propertyType: v.union(
      v.literal("room"),
      v.literal("apartment"),
      v.literal("house"),
      v.literal("studio"),
      v.literal("shared"),
    ),
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
      .withIndex("by_propertyType", (q) =>
        q.eq("propertyType", args.propertyType),
      )
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
    images: v.optional(
      v.array(
        v.object({
          publicId: v.string(),
          secureUrl: v.string(),
        }),
      ),
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
    return listingId;
  },
});
