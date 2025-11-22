import { useInfiniteQuery } from '@tanstack/react-query';
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
 * Hook to fetch blog posts filtered by a specific hashtag with infinite scroll
 */
export function useBlogPostsByHashtag(hashtag: string, limit: number = 20) {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['blog-posts-hashtag', hashtag, limit],
    queryFn: async ({ pageParam, signal }) => {
      const filter: {
        kinds: number[];
        '#t': string[];
        limit: number;
        until?: number;
      } = { 
        kinds: [30023], 
        '#t': [hashtag.toLowerCase()],
        limit: limit 
      };
      
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query(
        [filter],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) }
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
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      
      // Get the oldest timestamp from the last page
      const oldestPost = lastPage[lastPage.length - 1];
      const publishedAt = oldestPost.tags.find(([name]) => name === 'published_at')?.[1];
      const timestamp = publishedAt ? parseInt(publishedAt) : oldestPost.created_at;
      
      return timestamp - 1; // Subtract 1 since 'until' is inclusive
    },
    initialPageParam: undefined,
  });
}
