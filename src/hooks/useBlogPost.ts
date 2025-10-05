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
 * Hook to fetch a single blog post by author pubkey and d-tag identifier
 */
export function useBlogPost(pubkey: string, identifier: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blog-post', pubkey, identifier],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{
          kinds: [30023],
          authors: [pubkey],
          '#d': [identifier],
          limit: 1,
        }],
        { signal }
      );

      if (events.length === 0) return null;

      const event = events[0];
      
      // Validate the event
      if (!validateBlogPost(event)) return null;

      return event;
    },
    enabled: !!pubkey && !!identifier,
  });
}
