import { useMutation, useQuery } from 'convex/react';
import { useParams } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useCallback, useState } from 'react';

export default function ViewPoll() {
  const [voteId, setVoteId] = useState<Id<'votes'> | undefined>(undefined);
  const params = useParams();
  const pollId = params.id ?? null;

  const vote = useMutation(api.polls.vote);
  const poll = useQuery(api.polls.view, { id: pollId as Id<'polls'> });

  const handleVote = useCallback(
    async (option: Id<'options'>) => {
      const newVoteId = await vote({ option, vote: voteId });
      setVoteId(newVoteId);
    },
    [vote, voteId]
  );

  if (!poll) return null;

  return (
    <div className='flex justify-center'>
      <div className='bg-secondary w-full max-w-xl p-3 rounded-xl'>
        <h1 className='text-3xl'>{poll.question}</h1>

        <div className='flex flex-col gap-2'>
          {poll.options.map((option) => (
            <div
              className='flex flex-row gap-4 border p-2 text-lg hover:cursor-pointer hover:bg-neutral-300'
              key={option._id}
              onClick={() => handleVote(option._id)}
            >
              <span className='flex-1'>{option.text}</span>
              <span className='shrink'>({option.votes})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
