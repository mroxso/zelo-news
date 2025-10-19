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
 * Hook to fetch blog posts filtered by a specific hashtag
 */
export function useBlogPostsByHashtag(hashtag: string, limit: number = 50) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['blog-posts-hashtag', hashtag],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{
          kinds: [30023],
          '#t': [hashtag.toLowerCase()],
          limit: limit,
        }],
        { signal }
      );

      // Filter and validate events
      const validPosts = events.filter(validateBlogPost);

      // Sort by published_at (newest first), fallback to created_at
      return validPosts.sort((a, b) => {
        const aPublished = a.tags.find(([name]) => name === 'published_at')?.[1];
        const bPublished = b.tags.find(([name]) => name === 'published_at')?.[1];
        
        const aTime = aPublished ? parseInt(aPublished) : a.created_at;
        const bTime = bPublished ? parseInt(bPublished) : b.created_at;
        
        return bTime - aTime;
      });
    },
  });
}
