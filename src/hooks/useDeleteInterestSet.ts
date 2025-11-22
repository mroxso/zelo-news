import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';
import type { NostrEvent } from '@nostrify/nostrify';

export function useDeleteInterestSet() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventToDelete: NostrEvent) => {
      if (!user) {
        throw new Error('User must be logged in to delete interest sets');
      }

      // Create a deletion event (kind 5) that references the event to delete
      const event = await user.signer.signEvent({
        kind: 5,
        content: '',
        tags: [
          ['e', eventToDelete.id],
          ['a', `${eventToDelete.kind}:${eventToDelete.pubkey}:${eventToDelete.tags.find(([name]) => name === 'd')?.[1] || ''}`],
          ['client', 'zelo.news'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest-sets'] });
      toast({
        title: 'Success',
        description: 'Interest set deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to delete interest set:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete interest set. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
