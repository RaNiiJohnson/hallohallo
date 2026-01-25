import { defineSchema } from "convex/server";
import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  user: tables.user.index("by_slug", ["slug"]),
});

export default schema;
