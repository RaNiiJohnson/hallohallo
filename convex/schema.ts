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
    .searchIndex("search_all_fields", {
      searchField: "searchAll",
      filterFields: ["city", "type", "contractType"],
    }),

  RealestateListing: defineTable({
    title: v.string(),
    type: v.string(),
    location: v.optional(
      v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    ),
    city: v.string(),
    district: v.string(),
    price: v.string(),
    priceNumeric: v.optional(v.number()),
    deposit: v.string(),
    area: v.number(),
    bedrooms: v.number(),
    bathrooms: v.number(),
    floor: v.number(),
    pets: v.boolean(),
    photos: v.array(v.string()),
    coverPhoto: v.string(),
    description: v.string(),
    extras: v.array(v.string()),
    available: v.optional(v.number()),
    authorId: v.string(),
    authorName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    searchAll: v.optional(v.string()),
  })
    .index("by_authorId", ["authorId"])
    .index("by_city", ["city"])
    .index("by_type", ["type"])
    .index("by_price", ["price"])
    .index("by_bedrooms", ["bedrooms"])
    .index("by_priceNumeric", ["priceNumeric"])
    .searchIndex("search_all_fields", {
      searchField: "searchAll",
      filterFields: ["city", "type", "bedrooms", "priceNumeric"],
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
