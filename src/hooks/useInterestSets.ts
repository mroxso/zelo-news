import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import type { NostrEvent } from '@nostrify/nostrify';

export interface InterestSet {
  id: string;
  identifier: string;
  title?: string;
  image?: string;
  description?: string;
  hashtags: string[];
  event: NostrEvent;
}

function parseInterestSet(event: NostrEvent): InterestSet {
  const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const description = event.tags.find(([name]) => name === 'description')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, value]) => value);

  return {
    id: event.id,
    identifier,
    title,
    image,
    description,
    hashtags,
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

      // Deduplicate by 'd' tag identifier, keeping only the most recent event
      const eventsByIdentifier = new Map<string, NostrEvent>();
      for (const event of events) {
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        const existing = eventsByIdentifier.get(identifier);
        if (!existing || event.created_at > existing.created_at) {
          eventsByIdentifier.set(identifier, event);
        }
      }
      const dedupedEvents = Array.from(eventsByIdentifier.values());
      return dedupedEvents.map(parseInterestSet).sort((a, b) => {
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
