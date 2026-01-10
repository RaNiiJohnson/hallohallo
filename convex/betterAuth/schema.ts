import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { tables } from "./generatedSchema";

// Extend user table with custom fields
const extendedUser = defineTable({
  // Base fields from Better Auth
  name: v.string(),
  email: v.string(),
  emailVerified: v.boolean(),
  image: v.optional(v.union(v.null(), v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
  userId: v.optional(v.union(v.null(), v.string())),

  // Custom fields
  photo: v.optional(v.string()),
  bio: v.optional(v.string()),
  city: v.optional(v.string()),
  arrivalDate: v.optional(v.number()),
  status: v.optional(v.string()),
  journey: v.optional(v.array(v.string())),
  roles: v.optional(v.array(v.string())),
  isServiceProvider: v.optional(v.boolean()),
  // Infos pour Recruteur / Entrepris
  field: v.optional(v.string()),
  company: v.optional(v.string()),
})
  // Keep existing indexes from generatedSchema
  .index("email_name", ["email", "name"])
  .index("name", ["name"])
  .index("userId", ["userId"])
  .index("by_city", ["city"])
  .index("by_arrival", ["arrivalDate"]);

const schema = defineSchema({
  ...tables,
  user: extendedUser,
});

export default schema;
