import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  polls: defineTable({
    user: v.string(),
    question: v.string(),
    options: v.array(v.string())
  }).index("by_User", ["user"])
});
