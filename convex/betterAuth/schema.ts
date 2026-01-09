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
  bio: v.optional(v.string()),
  adresse: v.optional(v.string()),
})
  // Keep existing indexes from generatedSchema
  .index("email_name", ["email", "name"])
  .index("name", ["name"])
  .index("userId", ["userId"]);

const schema = defineSchema({
  ...tables,
  user: extendedUser,
});

export default schema;
