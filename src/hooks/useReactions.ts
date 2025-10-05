import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';

/**
 * Hook to fetch reactions (kind 7) for a specific event
 */
export function useReactions(eventId: string, eventAuthor: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['reactions', eventId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query(
        [{
          kinds: [7],
          '#e': [eventId],
          limit: 500,
        }],
        { signal }
      );

      // Count likes (all reactions except "-")
      const likes = events.filter(e => {
        const content = e.content.trim();
        return content !== '-';
      });

      return {
        likes,
        likeCount: likes.length,
      };
    },
    enabled: !!eventId && !!eventAuthor,
  });
}

/**
 * Hook to check if current user has reacted to an event
 */
export function useHasReacted(eventId: string) {
  const { user } = useCurrentUser();
  const { data } = useReactions(eventId, '');

  if (!user || !data) return false;

  return data.likes.some(like => like.pubkey === user.pubkey);
}

/**
 * Hook to publish a reaction (like)
 */
export function useReact() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, eventAuthor }: { eventId: string; eventAuthor: string }) => {
      if (!user) {
        throw new Error('You must be logged in to react');
      }

      const eventTemplate = {
        kind: 7,
        content: '+',
        tags: [
          ['e', eventId],
          ['p', eventAuthor],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await user.signer.signEvent(eventTemplate);
      await nostr.event(signedEvent);

      return signedEvent;
    },
    onSuccess: (_, variables) => {
      // Invalidate reactions query to refetch
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.eventId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to react',
        variant: 'destructive',
      });
    },
  });
}
