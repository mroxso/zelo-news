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

      // Sort by created_at descending (newest first)
      return validEvents.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: followedPubkeys.length > 0 && !isLoadingFollowing,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}
