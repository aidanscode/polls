import { useUser } from '@clerk/clerk-react';
import { Id } from '../../convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { useCallback, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';

const LOCAL_STORAGE_KEY = 'adnpolls';

function getVoteIdFromLocalStorage(
  pollId: Id<'polls'>
): { id: Id<'votes'>; optionId: Id<'options'> } | null {
  const rawCache = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (rawCache) {
    const cache = JSON.parse(rawCache);
    if (typeof cache === 'object') {
      const item = cache[pollId];
      if (
        typeof item === 'object' &&
        'id' in item &&
        typeof item.id === 'string' &&
        'optionId' in item &&
        typeof item.optionId === 'string'
      ) {
        return { id: item.id, optionId: item.optionId };
      }
    }
  }
  return null;
}

function saveVoteIdToLocalStorage(
  pollId: Id<'polls'>,
  voteId: Id<'votes'>,
  optionId: Id<'options'>
): void {
  const rawCache = localStorage.getItem(LOCAL_STORAGE_KEY);
  let cache: Record<string, any> = {};
  if (!!rawCache) {
    const parsed = JSON.parse(rawCache);
    if (typeof parsed === 'object') {
      cache = parsed;
    }
  }

  cache[pollId] = {
    id: voteId,
    optionId
  };

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cache));
}

export default function usePastVote(pollId: Id<'polls'> | null): {
  pastVote: { id: Id<'votes'>; optionId: Id<'options'> } | null;
  cacheVote: (id: Id<'votes'>, option: Id<'options'>) => void;
} {
  const [numSets, setNumSets] = useState(0);
  const { user, isSignedIn } = useUser();

  const shouldQuery = isSignedIn && !!pollId;

  const voteFromQuery = useQuery(
    api.polls.getVoteForUser,
    shouldQuery ? { id: pollId } : 'skip'
  );

  const vote = useMemo((): {
    id: Id<'votes'>;
    optionId: Id<'options'>;
  } | null => {
    if (!pollId) return null;

    if (isSignedIn) {
      return voteFromQuery
        ? { id: voteFromQuery._id, optionId: voteFromQuery.option }
        : null;
    }

    const fromLocalStorage = getVoteIdFromLocalStorage(pollId);
    if (fromLocalStorage) return fromLocalStorage;

    return null;
  }, [pollId, user, isSignedIn, numSets, voteFromQuery]);

  const cacheVote = useCallback(
    (id: Id<'votes'>, option: Id<'options'>) => {
      setNumSets((cur) => cur + 1);
      if (!pollId) throw new Error("Can't save a vote without a pollId");

      if (!shouldQuery) {
        saveVoteIdToLocalStorage(pollId, id, option);
      }
    },
    [setNumSets, shouldQuery]
  );
  return { pastVote: vote, cacheVote };
}
