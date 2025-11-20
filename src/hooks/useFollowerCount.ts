import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

/**
 * Hook to get follower count for a pubkey.
 * 
 * Ideally this would use NIP-45 COUNT verb for efficiency:
 * `["COUNT", <query_id>, {"kinds": [3], "#p": [<pubkey>]}]`
 * 
 * However, since the Nostrify library doesn't directly expose COUNT,
 * we query kind-3 events that reference the pubkey and count them.
 * 
 * Note: This queries up to 5000 events. For users with more followers,
 * the count will be capped at 5000 until NIP-45 COUNT is directly supported.
 */
export function useFollowerCount(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['follower-count', pubkey],
    queryFn: async (c) => {
      if (!pubkey) return 0;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      try {
        // Query kind-3 events (contact lists) that tag this pubkey
        // Using a high limit to approximate a count
        const events = await nostr.query(
          [{ kinds: [3], '#p': [pubkey], limit: 5000 }],
          { signal }
        );
        return events.length;
      } catch (error) {
        console.error('Failed to fetch follower count:', error);
        return 0;
      }
    },
    enabled: !!pubkey,
    staleTime: 60000, // Cache for 1 minute
  });
}
