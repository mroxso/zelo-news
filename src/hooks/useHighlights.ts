import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Hook to fetch highlights (kind 9802) for a specific event.
 * Highlights can reference events via 'e' or 'a' tags, or URLs via 'r' tags.
 */
export function useHighlights(event: NostrEvent | null | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['highlights', event?.id],
    queryFn: async (c) => {
      if (!event) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // For addressable events (kind 30000-39999), query by 'a' tag
      if (event.kind >= 30000 && event.kind < 40000) {
        const identifier = event.tags.find((t) => t[0] === 'd')?.[1] || '';
        const events = await nostr.query(
          [
            {
              kinds: [9802],
              '#a': [`${event.kind}:${event.pubkey}:${identifier}`],
              limit: 100,
            },
          ],
          { signal }
        );
        return events;
      } else {
        // For regular events, query by 'e' tag
        const events = await nostr.query(
          [
            {
              kinds: [9802],
              '#e': [event.id],
              limit: 100,
            },
          ],
          { signal }
        );
        return events;
      }
    },
    enabled: !!event?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Hook to fetch highlights (kind 9802) for a specific URL.
 */
export function useHighlightsByUrl(url: string | null | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['highlights-url', url],
    queryFn: async (c) => {
      if (!url) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query highlights with 'r' tag matching the URL
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            '#r': [url],
            limit: 100,
          },
        ],
        { signal }
      );
      return events;
    },
    enabled: !!url,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch all highlights by a specific user.
 */
export function useUserHighlights(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-highlights', pubkey],
    queryFn: async (c) => {
      if (!pubkey) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query all highlights (kind 9802) by the specified user
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            authors: [pubkey],
            limit: 100,
          },
        ],
        { signal }
      );

      // Sort by created_at descending (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch all highlights (for overview page).
 */
export function useAllHighlights(limit: number = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['all-highlights', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query all highlights (kind 9802)
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            limit,
          },
        ],
        { signal }
      );

      // Sort by created_at descending (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 30000,
  });
}

