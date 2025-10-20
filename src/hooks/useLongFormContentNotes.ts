import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface BlogPost extends NostrEvent {
  kind: 30023;
}

/**
 * Validates that a Nostr event is a valid NIP-23 blog post
 */
function validateLongFormContentNote(event: NostrEvent): event is BlogPost {
  // Must be kind 30023
  if (event.kind !== 30023) return false;

  // Must have required tags
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  // d and title are required for addressable events
  if (!d || !title) return false;

  return true;
}

/**
 * Hook to fetch all long form content notes from all authors
 */
export function useLongFormContentNotes() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['long-form-content-notes'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{
          kinds: [30023],
          limit: 100,
        }],
        { signal }
      );

      // Filter and validate events
      const validPosts = events.filter(validateLongFormContentNote);

      // Helper: safely parse published_at from tags
      const getPublishedAt = (event: NostrEvent): number | undefined => {
        const value = event.tags.find(([name]) => name === 'published_at')?.[1];
        if (!value) return undefined;
        const n = Number.parseInt(value, 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };

      // Only include posts that have a valid published_at tag
      const withPublishedAt = validPosts.filter((e) => getPublishedAt(e) !== undefined);

      // Sort strictly by published_at (newest first)
      return withPublishedAt.sort((a, b) => (getPublishedAt(b)! - getPublishedAt(a)!));
    },
  });
}
