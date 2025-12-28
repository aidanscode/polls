import { useMutation, useQuery } from 'convex/react';
import { useParams } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useCallback } from 'react';
import usePastVote from '@/hooks/PastVote';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import PollNotFound from './PollNotFound';
import { RefreshCcw } from 'lucide-react';

export default function ViewPoll() {
  const params = useParams();
  const pollId = params.id ?? null;

  const { pastVote, cacheVote } = usePastVote(
    pollId ? (pollId as Id<'polls'>) : null
  );

  const submitVote = useMutation(api.polls.vote);
  const poll = useQuery(api.polls.view, { id: pollId as Id<'polls'> });

  const handleVote = useCallback(
    async (option: Id<'options'>) => {
      const newVoteId = await submitVote({
        option,
        vote: pastVote ? pastVote.id : undefined
      });

      cacheVote(newVoteId, option);
    },
    [submitVote, pastVote, cacheVote]
  );

  if (poll === undefined) {
    return (
      <div className='flex flex-col items-center'>
        <RefreshCcw className='animate-spin' />
        <p>Loading...</p>
      </div>
    );
  }

  if (!poll) return <PollNotFound />;

  return (
    <div className='flex justify-center'>
      <div className='bg-secondary w-full max-w-xl p-3 rounded-xl'>
        <h1 className='text-3xl'>{poll.question}</h1>

        <div className='flex flex-col gap-2'>
          {poll.options.map((option) => (
            <motion.div
              layout
              animate
              transition={{ type: 'spring', stiffness: 350, damping: 50 }}
              className={cn([
                'flex flex-row gap-4 border p-2 text-lg hover:cursor-pointer hover:bg-neutral-300',
                pastVote && pastVote.optionId === option._id
                  ? 'border-2 border-blue-400 bg-blue-200'
                  : null
              ])}
              key={option._id}
              onClick={() => handleVote(option._id)}
            >
              <span className='flex-1'>{option.text}</span>
              <span className='shrink'>({option.votes})</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
