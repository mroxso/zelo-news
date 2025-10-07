import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
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
 * Hook to fetch blog posts by d-tag identifier only (without author pubkey)
 * Returns the most recent article with this d-tag across all authors
 */
export function useBlogPostByDTag(identifier: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blog-post-by-dtag', identifier],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{
          kinds: [30023],
          '#d': [identifier],
          limit: 10, // Get multiple in case there are duplicates
        }],
        { signal }
      );

      if (events.length === 0) return null;

      // Filter and validate events
      const validEvents = events.filter(validateBlogPost);
      
      if (validEvents.length === 0) return null;

      // Return the most recent valid event (highest created_at)
      const sortedEvents = validEvents.sort((a, b) => b.created_at - a.created_at);
      
      return sortedEvents[0];
    },
    enabled: !!identifier,
  });
}
