import { Id } from './_generated/dataModel';
import { internalMutation, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';

export const view = query({
  args: {
    id: v.nullable(v.string())
  },
  handler: async (ctx, args) => {
    if (args.id === null) return null;

    const pollId = ctx.db.normalizeId('polls', args.id);
    if (!pollId) return null;

    const poll = await ctx.db.get(pollId);
    if (!poll) {
      return null;
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

    await ctx.scheduler.runAfter(
      1000 * 60 * 60 * 24 * 7,
      internal.polls.deletePoll,
      {
        id: newPollId
      }
    );

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

export const getVoteForUser = query({
  args: {
    id: v.id('polls')
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    return await ctx.db
      .query('votes')
      .withIndex('by_Poll_by_User', (q) =>
        q.eq('poll', args.id).eq('user', user.tokenIdentifier)
      )
      .first();
  }
});

export const deletePoll = internalMutation({
  args: { id: v.id('polls') },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.id);
    if (!poll) return;

    const votes = await ctx.db
      .query('votes')
      .withIndex('by_Poll_by_User', (q) => q.eq('poll', args.id))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }

    const options = await ctx.db
      .query('options')
      .withIndex('by_Poll', (q) => q.eq('poll', args.id))
      .collect();
    for (const option of options) {
      await ctx.db.delete(option._id);
    }

    await ctx.db.delete(poll._id);
  }
});
