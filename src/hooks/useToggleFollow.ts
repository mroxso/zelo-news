import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useFollowing } from './useFollowing';
import { useNostrPublish } from './useNostrPublish';
import { useNostr } from '@nostrify/react';

/**
 * Hook to toggle following/unfollowing a user.
 * Publishes a kind 3 (contact list) event with the updated follows list according to NIP-02.
 */
export function useToggleFollow() {
  const { user } = useCurrentUser();
  const { data: followingList = [] } = useFollowing();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { nostr } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pubkey }: { pubkey: string }) => {
      if (!user) {
        throw new Error('Must be logged in to follow/unfollow');
      }

      // Get the latest kind 3 event to preserve all existing tags
      const signal = AbortSignal.timeout(1500);
      const events = await nostr.query(
        [{ kinds: [3], authors: [user.pubkey], limit: 1 }],
        { signal }
      );

      const existingEvent = events[0];
      const existingTags = existingEvent?.tags || [];

      // Check if already following
      const isFollowing = followingList.includes(pubkey);

      let newTags: string[][];

      if (isFollowing) {
        // Unfollow: remove all p tags with this pubkey
        newTags = existingTags.filter(
          (tag) => !(tag[0] === 'p' && tag[1] === pubkey)
        );
      } else {
        // Follow: append new p tag with pubkey and empty relay/petname
        // Format: ["p", <pubkey>, <relay_url>, <petname>]
        newTags = [...existingTags, ['p', pubkey, '', '']];
      }

      // Publish the updated contact list
      const event = await publishEvent({
        kind: 3,
        content: '',
        tags: newTags,
        created_at: Math.floor(Date.now() / 1000),
      });

      return { event, isFollowing: !isFollowing };
    },
    onSuccess: (_, { pubkey: targetPubkey }) => {
      // Invalidate following queries to refetch
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['following-posts'] });
      // Invalidate the current user's following count
      if (user?.pubkey) {
        queryClient.invalidateQueries({ queryKey: ['following-count', user.pubkey] });
      }
      // Invalidate the target user's follower count
      queryClient.invalidateQueries({ queryKey: ['follower-count', targetPubkey] });
    },
  });
}
