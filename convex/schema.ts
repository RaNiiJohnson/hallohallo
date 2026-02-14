import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  service_provider: defineTable({
    userId: v.string(),
    serviceType: v.string(),
    description: v.optional(v.string()),
    experience: v.optional(v.string()),
    tarif: v.optional(v.string()),
    available: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_availability", ["available"]),

  JobOffer: defineTable({
    title: v.string(),
    type: v.string(),
    slug: v.optional(v.string()),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    contractType: v.string(),
    city: v.string(),
    duration: v.string(),
    startDate: v.string(),
    company: v.string(),
    description: v.string(),
    certificates: v.array(v.string()),
    salary: v.string(),
    authorId: v.string(),
    authorName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    searchAll: v.optional(v.string()),
  })
    .index("by_authorId", ["authorId"])
    .index("by_city", ["city"])
    .index("by_type", ["type"])
    .index("by_contract", ["contractType"])
    .index("by_salary", ["salary"])
    .index("by_slug", ["slug"])
    .searchIndex("search_all_fields", {
      searchField: "searchAll",
      filterFields: ["city", "type", "contractType"],
    }),

  RealestateListing: defineTable({
    title: v.string(),
    propertyType: v.union(
      v.literal("room"),
      v.literal("apartment"),
      v.literal("house"),
      v.literal("studio"),
      v.literal("shared"),
    ),
    listingMode: v.union(v.literal("rent"), v.literal("sale")),
    slug: v.optional(v.string()),
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
    currency: v.literal("EUR"),
    period: v.optional(v.literal("month")),

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

    authorId: v.string(),
    authorName: v.optional(v.string()),
    updatedAt: v.number(),
    searchAll: v.optional(v.string()),
  })
    .index("by_authorId", ["authorId"])
    .index("by_city", ["city"])
    .index("by_propertyType", ["propertyType"])
    .index("by_listingMode", ["listingMode"])
    .index("by_price", ["price"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_slug", ["slug"])
    .searchIndex("search_all_fields", {
      searchField: "searchAll",
      filterFields: [
        "city",
        "propertyType",
        "listingMode",
        "bedrooms",
        "price",
      ],
    }),

  JobContactInfo: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    jobId: v.id("JobOffer"),
  }).index("by_jobId", ["jobId"]),

  RealestateContactInfo: defineTable({
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    listingId: v.id("RealestateListing"),
    listing: v.string(),
  }).index("by_listingId", ["listingId"]),

  bookmarks: defineTable({
    userId: v.string(),
    resourceId: v.union(v.id("JobOffer"), v.id("RealestateListing")),
    resourceType: v.union(v.literal("job"), v.literal("realEstate")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_user_resource", ["userId", "resourceId"]),
});
