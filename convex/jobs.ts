import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";
import { generatedSlug } from "../src/lib/utils";

export const getJobWithContact = query({
  args: { id: v.id("JobOffer") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get("JobOffer", args.id);
    if (!job) return null;

    // Récupération rapide via l'index
    const contact = await ctx.db
      .query("JobContactInfo")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.id))
      .unique();

    return { ...job, contact };
  },
});

export const getJobMetadata = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db.get("JobOffer", args.id as Id<"JobOffer">);
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
  },
  handler: async (ctx, args) => {
    const { searchTerm, type, contractType } = args;

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
      return await searchResult.paginate(args.paginationOpts);
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
    if (type && contractType) {
      return {
        ...results,
        page: results.page.filter((job) => job.contractType === contractType),
      };
    }

    return results;
  },
});

export const createJob = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("auPair"),
      v.literal("training"),
      v.literal("voluntary"),
      v.literal("internship"),
      v.literal("miniJob"),
      v.literal("job"),
      v.literal("freelance"),
      v.literal("scholarship"),
    ),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: v.union(
      v.literal("CDI"),
      v.literal("CDD"),
      v.literal("FSJ/FOJ/BFD"),
      v.literal("fullTime"),
      v.literal("partTime"),
      v.literal("freelance"),
      v.literal("apprenticeship"),
    ),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.number(),
    salaryPeriod: v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    const job = await ctx.db.insert("JobOffer", {
      ...args,
      slug: generatedSlug(args.title),
      authorId: user._id,
      authorName: user.name,
      updatedAt: Date.now(),
      searchAll: searchAllContent,
    });
    return job;
  },
});

export const updateJob = mutation({
  args: {
    id: v.id("JobOffer"),
    title: v.string(),
    type: v.union(
      v.literal("auPair"),
      v.literal("training"),
      v.literal("voluntary"),
      v.literal("internship"),
      v.literal("miniJob"),
      v.literal("job"),
      v.literal("freelance"),
      v.literal("scholarship"),
    ),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: v.union(
      v.literal("CDI"),
      v.literal("CDD"),
      v.literal("FSJ/FOJ/BFD"),
      v.literal("fullTime"),
      v.literal("partTime"),
      v.literal("freelance"),
      v.literal("apprenticeship"),
    ),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.number(),
    salaryPeriod: v.union(
      v.literal("hour"),
      v.literal("month"),
      v.literal("year"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throw new Error("Job not found");

    // Remove id from args before updating because it's not a field of the document
    const { id, ...updateData } = args;

    const searchAllContent = `${args.title} ${args.type} ${args.city} ${args.contractType} ${args.description}`;

    await ctx.db.patch("JobOffer", id, {
      ...updateData,
      updatedAt: Date.now(),
      searchAll: searchAllContent,
    });
  },
});

export const deleteJob = mutation({
  args: {
    id: v.id("JobOffer"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db.get("JobOffer", args.id);
    if (!existing) throw new Error("Job not found");

    await ctx.db.delete("JobOffer", args.id);
  },
});

// export const getFilteredJobs = query({
//   args: {
//     searchQuery: v.optional(v.string()),
//     type: v.optional(v.string()),
//     contractType: v.optional(v.string()),
//     city: v.optional(v.string()),
//     page: v.optional(v.number()),
//     limit: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     const page = args.page ?? 1;
//     const limit = args.limit ?? 10;
//     const offset = (page - 1) * limit;

//     let q = ctx.db.query("JobOffer");

//     // 1) Recherche texte sur le titre
//     if (args.searchQuery && args.searchQuery.trim().length > 0) {
//       q = q.withSearchIndex("search_title", (s) => {
//         let search = s.search("title", args.searchQuery!);

//         // filtres supportés par filterFields du search index
//         if (args.type && args.type !== "all") {
//           search = search.eq("type", args.type);
//         }
//         if (args.contractType && args.contractType !== "all") {
//           search = search.eq("contractType", args.contractType);
//         }
//         if (args.city && args.city !== "all") {
//           search = search.eq("city", args.city);
//         }

//         return search;
//       });
//     } else {
//       // 2) Pas de recherche texte : on utilise les indexes normaux
//       if (args.type && args.type !== "all") {
//         q = q.withIndex("by_type", (i) => i.eq("type", args.type));
//       } else if (args.contractType && args.contractType !== "all") {
//         q = q.withIndex("by_contract", (i) =>
//           i.eq("contractType", args.contractType),
//         );
//       } else if (args.city && args.city !== "all") {
//         q = q.withIndex("by_city", (i) => i.eq("city", args.city));
//       }
//       // si plusieurs filtres sans searchQuery, on en pousse un dans l’index
//       // et on complètera en JS si besoin (voir plus bas)
//     }

//     // 3) On récupère les résultats triés
//     const allJobs = await q.order("desc").collect();

//     // 4) Filtrage complémentaire en TypeScript si plusieurs filtres sans search
//     let filtered = allJobs;

//     if (!args.searchQuery) {
//       if (args.type && args.type !== "all") {
//         filtered = filtered.filter((job) => job.type === args.type);
//       }
//       if (args.contractType && args.contractType !== "all") {
//         filtered = filtered.filter(
//           (job) => job.contractType === args.contractType,
//         );
//       }
//       if (args.city && args.city !== "all") {
//         filtered = filtered.filter((job) => job.city === args.city);
//       }
//     }

//     const total = filtered.length;
//     const totalPages = Math.ceil(total / limit);
//     const pageItems = filtered.slice(offset, offset + limit);

//     return {
//       jobs: pageItems,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPreviousPage: page > 1,
//       },
//     };
//   },
// });
