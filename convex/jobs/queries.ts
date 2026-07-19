import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { authComponent } from "../auth/auth";
import { r2 } from "../integrations/r2";

export const getR2FileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    const url = await r2.getUrl(storageId);
    return url ?? null;
  },
});

export const getJobWithContact = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const job = await ctx.db
      .query("JobOffer")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!job) return null;

    // Récupération rapide via l'index
    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
      .unique();

    const user = await authComponent.safeGetAuthUser(ctx);
    let isBookmarked = false;
    if (user) {
      const existingBookmark = await ctx.db
        .query("bookmarks")
        .withIndex("by_user_resource", (q) =>
          q.eq("userId", user._id).eq("resourceId", job._id),
        )
        .first();
      if (existingBookmark) isBookmarked = true;
    }

    return { ...job, contact, isBookmarked };
  },
});

export const getJobWithContactById = query({
  args: { id: v.id("JobOffer") },
  handler: async (ctx, { id }) => {
    const job = await ctx.db.get(id);

    if (!job) return null;

    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
      .unique();

    return { ...job, contact };
  },
});

export const getJobMetadata = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const job = await ctx.db
      .query("JobOffer")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    return job;
  },
});

export const getJobs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchTerm: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("auPair"),
        v.literal("training"),
        v.literal("voluntary"),
        v.literal("internship"),
        v.literal("miniJob"),
        v.literal("job"),
        v.literal("freelance"),
        v.literal("scholarship"),
      ),
    ),
    contractType: v.optional(
      v.union(
        v.literal("CDI"),
        v.literal("CDD"),
        v.literal("FSJ/FOJ/BFD"),
        v.literal("fullTime"),
        v.literal("partTime"),
        v.literal("freelance"),
        v.literal("apprenticeship"),
      ),
    ),
    bookmarkedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { searchTerm, type, contractType, bookmarkedOnly } = args;
    const user = await authComponent.safeGetAuthUser(ctx);

    if (bookmarkedOnly) {
      if (!user) {
        return { page: [], isDone: true, continueCursor: "" };
      }
      const bookmarksPage = await ctx.db
        .query("bookmarks")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("resourceType"), "job"))
        .order("desc")
        .paginate(args.paginationOpts);

      const enrichedPage = await Promise.all(
        bookmarksPage.page.map(async (b) => {
          const job = await ctx.db.get(b.resourceId as Id<"JobOffer">);
          if (!job) return null;
          return { ...job, isBookmarked: true } as typeof job & {
            isBookmarked: boolean;
          };
        }),
      );

      const filteredPage = enrichedPage.filter(
        (j): j is NonNullable<typeof j> => j !== null,
      );
      return { ...bookmarksPage, page: filteredPage };
    }

    // CAS 1 : Recherche textuelle active
    if (searchTerm) {
      const searchResult = ctx.db
        .query("JobOffer")
        .withSearchIndex("search_all_fields", (q) => {
          let search = q.search("searchAll", searchTerm);
          if (type) search = search.eq("type", type);
          if (contractType) search = search.eq("contractType", contractType);
          return search;
        });

      // avant: return await searchResult.collect();
      const results = await searchResult.paginate(args.paginationOpts);

      const enrichedPage = await Promise.all(
        results.page.map(async (job) => {
          let isBookmarked = false;
          if (user) {
            const existingBookmark = await ctx.db
              .query("bookmarks")
              .withIndex("by_user_resource", (q) =>
                q.eq("userId", user._id).eq("resourceId", job._id),
              )
              .first();
            if (existingBookmark) isBookmarked = true;
          }
          return { ...job, isBookmarked };
        }),
      );

      return { ...results, page: enrichedPage };
    }

    // CAS 2 : Pas de recherche textuelle -> Utilisation des index de filtrage
    let results;

    // On utilise les index définis dans schéma
    if (type) {
      results = await ctx.db
        .query("JobOffer")
        .withIndex("by_type", (q) => q.eq("type", type))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (contractType) {
      results = await ctx.db
        .query("JobOffer")
        .withIndex("by_contract", (q) => q.eq("contractType", contractType))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("JobOffer")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Filtre manuel si les deux (type ET contract) sont présents sans searchTerm
    // (car Convex ne supporte qu'un seul index à la fois)
    let pageFiltered = results.page;
    if (type && contractType) {
      pageFiltered = pageFiltered.filter(
        (job) => job.contractType === contractType,
      );
    }

    const enrichedPage = await Promise.all(
      pageFiltered.map(async (job) => {
        let isBookmarked = false;
        if (user) {
          const existingBookmark = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_resource", (q) =>
              q.eq("userId", user._id).eq("resourceId", job._id),
            )
            .first();
          if (existingBookmark) isBookmarked = true;
        }
        return { ...job, isBookmarked };
      }),
    );

    return { ...results, page: enrichedPage };
  },
});
