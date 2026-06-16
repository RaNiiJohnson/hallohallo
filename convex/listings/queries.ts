// convex/listings.ts
import {
  OrderedQuery,
  paginationOptsValidator,
  Query,
  QueryInitializer,
} from "convex/server";
import { v } from "convex/values";
import { DataModel, Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { authComponent } from "../auth/auth";
import { r2 } from "../integrations/r2";

// Resolve R2 storageId keys to signed URLs.
// Falls back to the old Cloudinary secureUrl for existing records.
async function resolveImages(
  images: Array<{
    storageId?: string;
    url?: string;
    publicId?: string;
    secureUrl?: string;
  }>,
) {
  return Promise.all(
    images.map(async (img) => {
      if (img.storageId) {
        // r2.getUrl generates a signed URL for the given object key
        const url = await r2.getUrl(img.storageId);
        return { ...img, url: url ?? img.secureUrl ?? "" };
      }
      // Legacy Cloudinary record: keep secureUrl as url
      return { ...img, url: img.secureUrl ?? "" };
    }),
  );
}

export const getListingWithContact = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const listing = await ctx.db
      .query("RealestateListing")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!listing) return null;

    const user = await authComponent.safeGetAuthUser(ctx);
    let isBookmarked = false;
    if (user) {
      const existingBookmark = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_resource", (q) =>
          q.eq("userId", user._id).eq("resourceId", listing._id),
        )
        .first();
      if (existingBookmark) isBookmarked = true;
    }

    // Récupération des informations de contact via l'index
    const contact = await ctx.db
      .query("RealestateContactInfo")
      .withIndex("by_listingId", (q) => q.eq("listingId", listing._id))
      .unique(); // Utilise .unique() si une annonce n'a qu'un seul bloc de contact

    const images = await resolveImages(listing.images ?? []);

    return {
      ...listing,
      images,
      contact,
      isBookmarked,
    };
  },
});

export const getListingMetadata = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const listing = await ctx.db
      .query("RealestateListing")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

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
    bookmarkedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const {
      searchTerm,
      propertyType,
      bedrooms,
      minPrice,
      maxPrice,
      bookmarkedOnly,
    } = args;
    const user = await authComponent.safeGetAuthUser(ctx);

    if (bookmarkedOnly) {
      if (!user) return { page: [], isDone: true, continueCursor: "" };
      const bookmarksPage = await ctx.db
        .query("bookmarks")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("resourceType"), "realEstate"))
        .order("desc")
        .paginate(args.paginationOpts);

      const enrichedPage = await Promise.all(
        bookmarksPage.page.map(async (b) => {
          const listing = await ctx.db.get(
            b.resourceId as Id<"RealestateListing">,
          );
          if (!listing) return null;
          return { ...listing, isBookmarked: true } as typeof listing & {
            isBookmarked: boolean;
          };
        }),
      );

      const filteredPage = enrichedPage.filter(
        (j): j is NonNullable<typeof j> => j !== null,
      );
      return { ...bookmarksPage, page: filteredPage };
    }

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
    const results = await filtered.paginate(args.paginationOpts);

    const enrichedPage = await Promise.all(
      results.page.map(async (listing) => {
        let isBookmarked = false;
        if (user) {
          const existingBookmark = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_resource", (q) =>
              q.eq("userId", user._id).eq("resourceId", listing._id),
            )
            .first();
          if (existingBookmark) isBookmarked = true;
        }
        const images = await resolveImages(listing.images ?? []);
        return { ...listing, images, isBookmarked };
      }),
    );

    return { ...results, page: enrichedPage };
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
        const images = await resolveImages(listing.images ?? []);
        return { ...listing, images, contact };
      }),
    );
  },
});

export const getSimilarRealEstateListings = query({
  args: {
    excludeSlug: v.string(),
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
      .filter((q) => q.neq(q.field("slug"), args.excludeSlug))
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
          q.neq(q.field("slug"), args.excludeSlug),
          q.neq(q.field("city"), args.city), // éviter les doublons ville déjà pris
        ),
      )
      .order("desc")
      .take(remaining);

    const combined = [...byCity, ...byType];
    return Promise.all(
      combined.map(async (listing) => {
        const images = await resolveImages(listing.images ?? []);
        return { ...listing, images };
      }),
    );
  },
});
