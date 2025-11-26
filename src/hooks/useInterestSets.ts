import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import type { NostrEvent } from '@nostrify/nostrify';
import { deduplicateInterestSetEvents, parseInterestSetEvent } from '@/lib/interestSets';

export interface InterestSet {
  id: string;
  identifier: string;
  title?: string;
  image?: string;
  description?: string;
  hashtags: string[];
  event: NostrEvent;
}

function eventToInterestSet(event: NostrEvent): InterestSet {
  const parsed = parseInterestSetEvent(event);
  return {
    id: parsed.id,
    identifier: parsed.identifier,
    title: parsed.title,
    image: parsed.image,
    description: parsed.description,
    hashtags: parsed.hashtags,
    event,
  };
}

export function useInterestSets() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['interest-sets', user?.pubkey],
    queryFn: async (c) => {
      if (!user) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [
          {
            kinds: [30015],
            authors: [user.pubkey],
          },
        ],
        { signal }
      );

      // Use shared utility to deduplicate by 'd' tag identifier
      const eventsByIdentifier = deduplicateInterestSetEvents(events);
      const dedupedEvents = Array.from(eventsByIdentifier.values());
      
      return dedupedEvents.map(eventToInterestSet).sort((a, b) => {
        // Sort by title if available, otherwise by identifier
        const aName = a.title || a.identifier;
        const bName = b.title || b.identifier;
        return aName.localeCompare(bName);
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
