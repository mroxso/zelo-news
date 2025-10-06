import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useUserBookmarks } from './useUserBookmarks';
import type { NostrEvent } from '@nostrify/nostrify';

interface BlogPost extends NostrEvent {
  kind: 30023;
}

/**
 * Validates that a Nostr event is a valid NIP-23 blog post
 */
function validateBlogPost(event: NostrEvent): event is BlogPost {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  if (!d || !title) return false;

  return true;
}

/**
 * Hook to fetch the full blog post events for a user's bookmarked articles.
 * Parses article coordinates and queries for the actual events.
 */
export function useUserBookmarkedArticles(pubkey: string | undefined) {
  const { nostr } = useNostr();
  const { data: bookmarks = [], isLoading: isLoadingBookmarks } = useUserBookmarks(pubkey);

  return useQuery({
    queryKey: ['user-bookmarked-articles', pubkey, bookmarks],
    queryFn: async (c) => {
      if (bookmarks.length === 0) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Parse article coordinates (format: kind:pubkey:d-tag)
      const parsedCoordinates = bookmarks
        .map((coord) => {
          const parts = coord.split(':');
          if (parts.length !== 3) return null;
          const [kind, pubkey, dTag] = parts;
          return { kind: parseInt(kind), pubkey, dTag };
        })
        .filter((coord): coord is { kind: number; pubkey: string; dTag: string } => 
          coord !== null && coord.kind === 30023
        );

      if (parsedCoordinates.length === 0) {
        return [];
      }

      // Query for all bookmarked articles
      // Group by author to make efficient queries
      const authorGroups = new Map<string, string[]>();
      parsedCoordinates.forEach(({ pubkey, dTag }) => {
        if (!authorGroups.has(pubkey)) {
          authorGroups.set(pubkey, []);
        }
        authorGroups.get(pubkey)!.push(dTag);
      });

      // Create filter for each author
      const filters = Array.from(authorGroups.entries()).map(([pubkey, dTags]) => ({
        kinds: [30023],
        authors: [pubkey],
        '#d': dTags,
      }));

      const events = await nostr.query(filters, { signal });

      // Filter and validate events
      const validArticles = events.filter(validateBlogPost);

      // Sort by created_at descending (newest first)
      return validArticles.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey && !isLoadingBookmarks && bookmarks.length > 0,
    staleTime: 60000, // Consider data fresh for 1 minute
  });
}
