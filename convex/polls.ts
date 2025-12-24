import { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const view = query({
  args: {
    id: v.nullable(v.id('polls'))
  },
  handler: async (ctx, args) => {
    if (args.id === null) return null;

    const poll = await ctx.db.get(args.id);
    if (!poll) {
      throw new Error('Poll does not exist');
    }

    const options = await Promise.all(
      (
        await ctx.db
          .query('options')
          .withIndex('by_Poll', (q) => q.eq('poll', poll._id))
          .collect()
      ).map(async (option) => {
        return {
          ...option,
          votes: (
            await ctx.db
              .query('votes')
              .withIndex('by_Option', (q) => q.eq('option', option._id))
              .collect()
          ).length
        };
      })
    );

    const sortedOptions = options.sort((a, b) => b.votes - a.votes);

    return { _id: poll._id, question: poll.question, options: sortedOptions };
  }
});

export const create = mutation({
  args: {
    question: v.string(),
    options: v.array(v.string())
  },
  handler: async (ctx, args): Promise<Id<'polls'>> => {
    const trimmedQuestion = args.question.trim();
    if (!trimmedQuestion) {
      throw new Error('You must supply a question');
    }
    let options = args.options.map((opt) => opt.trim()).filter((opt) => !!opt);
    if (!options.length) {
      throw new Error('You must supply at least one option');
    }

    const identity = await ctx.auth.getUserIdentity();
    const userId = identity ? identity.tokenIdentifier : undefined;

    const newPollId = await ctx.db.insert('polls', {
      user: userId,
      question: trimmedQuestion
    });

    for (const option of options) {
      await ctx.db.insert('options', {
        poll: newPollId,
        text: option
      });
    }

    return newPollId;
  }
});

export const vote = mutation({
  args: {
    option: v.id('options'),
    vote: v.optional(v.id('votes'))
  },
  handler: async (ctx, args) => {
    const option = await ctx.db.get(args.option);
    if (!option) throw new Error('Option does not exist');

    const user = await ctx.auth.getUserIdentity();
    const userId = user?.tokenIdentifier ?? undefined;

    let voteId = args.vote;

    if (voteId) {
      const vote = await ctx.db.get(voteId);
      if (!vote) throw new Error('Existing vote does not exist');
      if (vote.user !== userId) throw new Error('Cannot edit this vote');

      await ctx.db.patch('votes', vote._id, { option: option._id });
    } else {
      voteId = await ctx.db.insert('votes', {
        poll: option.poll,
        option: option._id,
        user: userId
      });
    }

    return voteId;
  }
});
