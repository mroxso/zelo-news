import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import { useAppContext } from './useAppContext';
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

/**
 * Hook to get interest sets for the current user.
 * 
 * This hook uses a two-tier approach:
 * 1. NostrSync (via AppConfig) is the primary source that syncs interest sets on login.
 * 2. This hook fetches full event data from Nostr for operations that need it (edit/delete).
 * 
 * While AppConfig provides the hashtags and identifiers for interest sets,
 * fetching the full event data from Nostr is necessary to access additional metadata
 * such as title, image, and description, which are not stored in AppConfig.
 * The full event is also required to obtain the event ID for deletion operations.
 * 
 * The hook only fetches from Nostr when AppConfig has interest sets data,
 * ensuring NostrSync remains the authoritative sync mechanism.
 */
export function useInterestSets() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { config } = useAppContext();
  
  // Get the identifiers from AppConfig (synced by NostrSync)
  const syncedIdentifiers = Object.keys(config.interestSetsMetadata.sets);

  return useQuery({
    queryKey: ['interest-sets', user?.pubkey, config.interestSetsMetadata.updatedAt],
    queryFn: async (c) => {
      if (!user) return [];
      
      // If no synced data in AppConfig, return empty (NostrSync will populate it)
      if (syncedIdentifiers.length === 0) return [];

      // Fetch full events from Nostr for the identifiers we know exist from NostrSync
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [
          {
            kinds: [30015],
            authors: [user.pubkey],
            '#d': syncedIdentifiers,
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
