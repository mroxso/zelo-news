import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';

/**
 * Hook to fetch the user's bookmarks list (NIP-51 kind 10003).
 * Returns an array of 'a' tags representing bookmarked articles.
 */
export function useBookmarks() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['bookmarks', user?.pubkey],
    queryFn: async (c) => {
      if (!user?.pubkey) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for kind 10003 (Bookmarks) events by the current user
      const events = await nostr.query(
        [
          {
            kinds: [10003],
            authors: [user.pubkey],
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
    enabled: !!user?.pubkey,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

/**
 * Hook to fetch the full bookmark event for the current user.
 * Useful for getting all bookmark types (notes, articles, URLs, hashtags).
 */
export function useBookmarkEvent() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['bookmark-event', user?.pubkey],
    queryFn: async (c) => {
      if (!user?.pubkey) {
        return null;
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      const events = await nostr.query(
        [
          {
            kinds: [10003],
            authors: [user.pubkey],
            limit: 1,
          },
        ],
        { signal }
      );

      const bookmarkEvent = events.sort((a, b) => b.created_at - a.created_at)[0];

      return bookmarkEvent || null;
    },
    enabled: !!user?.pubkey,
    staleTime: 30000,
  });
}
