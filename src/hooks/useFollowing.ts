import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';

/**
 * Hook to fetch the list of pubkeys that the current user follows.
 * Returns the pubkeys from the user's kind 3 contact list event.
 */
export function useFollowing() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['following', user?.pubkey],
    queryFn: async (c) => {
      if (!user?.pubkey) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1500)]);
      
      // Query kind 3 (contact list) for the current user
      const events = await nostr.query(
        [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
        { signal }
      );

      if (events.length === 0) {
        return [];
      }

      // Extract pubkeys from p tags
      const contactEvent = events[0];
      const followedPubkeys = contactEvent.tags
        .filter(([tagName]) => tagName === 'p')
        .map(([, pubkey]) => pubkey)
        .filter((pubkey): pubkey is string => !!pubkey);

      return followedPubkeys;
    },
    enabled: !!user?.pubkey,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
