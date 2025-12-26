import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  polls: defineTable({
    user: v.optional(v.string()),
    question: v.string()
  }).index('by_User', ['user']),

  options: defineTable({
    poll: v.id('polls'),
    text: v.string()
  }).index('by_Poll', ['poll']),

  votes: defineTable({
    poll: v.id('polls'),
    option: v.id('options'),
    user: v.optional(v.string())
  })
    .index('by_Option', ['option'])
    .index('by_Poll_by_User', ['poll', 'user'])
});
