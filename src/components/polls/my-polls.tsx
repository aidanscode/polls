import { useUser } from '@clerk/clerk-react';
import { usePaginatedQuery } from 'convex/react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../../convex/_generated/api';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '../ui/button';

function FormatName({ name }: { name: string }) {
  return name.length <= 24 ? name : name.substring(0, 21) + '...';
}

function FormatTimestamp({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };

  const formatter = new Intl.DateTimeFormat(navigator.language, options);

  return <span>{formatter.format(d)}</span>;
}

export default function MyPolls() {
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const navigate = useNavigate();
  const {
    results: polls,
    status,
    loadMore,
    isLoading
  } = usePaginatedQuery(
    api.polls.mine,
    isClerkLoaded && isSignedIn ? {} : 'skip',
    { initialNumItems: 10 }
  );

  useEffect(() => {
    if (isClerkLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isClerkLoaded, isSignedIn]);

  const openPoll = useCallback((id: Id<'polls'>) => {
    if (document.getSelection()?.type == 'Range') {
      //Prevent navigation if the click was just the user highlighting some text
      return;
    }

    navigate(`/poll/${id}`);
  }, []);

  if (!isClerkLoaded || !isSignedIn) {
    return (
      <div className='flex flex-col items-center'>
        <RefreshCcw className='animate-spin' />
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'LoadingFirstPage') {
    return (
      <div className='flex flex-col items-center'>
        <RefreshCcw className='animate-spin' />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className='w-full max-w-xl mx-auto'>
      <h1 className='text-3xl text-center'>My Past Polls</h1>
      <div className='flex flex-col items-center gap-3 mt-5'>
        {polls.map((poll) => (
          <motion.div
            key={poll._id}
            className='flex flex-row justify-between border p-2 w-full bg-secondary hover:cursor-pointer hover:bg-neutral-300'
            onClick={() => openPoll(poll._id)}
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <p>
              <FormatName name={poll.question} />
            </p>
            <p>
              <FormatTimestamp timestamp={poll._creationTime} />
            </p>
          </motion.div>
        ))}
        {status === 'CanLoadMore' ? (
          <Button
            onClick={() => loadMore(10)}
            disabled={status !== 'CanLoadMore'}
            className='hover:cursor-pointer'
          >
            Load More {isLoading && <RefreshCcw className='animate-spin' />}
          </Button>
        ) : (
          <p className='text-secondary-foreground italic'>
            (Showing All Results)
          </p>
        )}
      </div>
    </div>
  );
}
