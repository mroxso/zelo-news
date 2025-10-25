import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useFollowing } from './useFollowing';

/**
 * Hook to fetch long-form blog posts (kind 30023) from authors the user follows.
 */
export function useFollowingBlogPosts() {
  const { nostr } = useNostr();
  const { data: followedPubkeys = [], isLoading: isLoadingFollowing } = useFollowing();

  return useQuery({
    queryKey: ['following-blog-posts', followedPubkeys],
    queryFn: async (c) => {
      if (followedPubkeys.length === 0) {
        return [];
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query kind 30023 (long-form content) from followed authors
      const events = await nostr.query(
        [
          {
            kinds: [30023],
            authors: followedPubkeys,
            limit: 50,
          },
        ],
        { signal }
      );

      // Filter out events without required tags
      const validEvents = events.filter((event: NostrEvent) => {
        const hasTitle = event.tags.some(([name]) => name === 'title');
        const hasDTag = event.tags.some(([name]) => name === 'd');
        return hasTitle && hasDTag;
      });

      // Helper: safely parse published_at from tags
      const getPublishedAt = (event: NostrEvent): number | undefined => {
        const value = event.tags.find(([name]) => name === 'published_at')?.[1];
        if (!value) return undefined;
        const n = Number.parseInt(value, 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };

      // Only include posts that have a valid published_at tag
      const withPublishedAt = validEvents.filter((e) => getPublishedAt(e) !== undefined);

      // Sort strictly by published_at (newest first)
      return withPublishedAt.sort((a, b) => (getPublishedAt(b)! - getPublishedAt(a)!));
    },
    enabled: followedPubkeys.length > 0 && !isLoadingFollowing,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}
