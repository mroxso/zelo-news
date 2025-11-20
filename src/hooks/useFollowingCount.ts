import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

/**
 * Hook to get following count for a pubkey.
 * Gets the most recent kind-3 event (contact list) and counts the 'p' tags.
 */
export function useFollowingCount(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['following-count', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return 0;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      try {
        // Query the user's most recent kind-3 event (contact list)
        const events = await nostr.query(
          [{ kinds: [3], authors: [pubkey], limit: 1 }],
          { signal }
        );

        if (events.length === 0) return 0;

        // Count the number of 'p' tags (people being followed)
        const followingCount = events[0].tags.filter(([tag]) => tag === 'p').length;
        return followingCount;
      } catch (error) {
        console.error('Failed to fetch following count:', error);
        return 0;
      }
    },
    enabled: !!pubkey,
    staleTime: 60000, // Cache for 1 minute
  });
}
