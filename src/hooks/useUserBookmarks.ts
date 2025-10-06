import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

/**
 * Hook to fetch a user's bookmarks list (NIP-51 kind 10003) by their pubkey.
 * Returns an array of 'a' tags representing bookmarked articles.
 */
export function useUserBookmarks(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-bookmarks', pubkey],
    queryFn: async (c) => {
      if (!pubkey) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for kind 10003 (Bookmarks) events by the specified user
      const events = await nostr.query(
        [
          {
            kinds: [10003],
            authors: [pubkey],
            limit: 1,
          },
        ],
        { signal }
      );

      // Get the most recent bookmark list event
      const bookmarkEvent = events.sort((a, b) => b.created_at - a.created_at)[0];

      if (!bookmarkEvent) {
        return [];
      }

      // Extract 'a' tags (addressable event references for articles)
      const bookmarkedArticles = bookmarkEvent.tags
        .filter((tag) => tag[0] === 'a')
        .map((tag) => tag[1]);

      return bookmarkedArticles;
    },
    enabled: !!pubkey,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}
