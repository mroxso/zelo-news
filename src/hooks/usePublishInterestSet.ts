import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';
import { useAppContext } from './useAppContext';

export interface PublishInterestSetParams {
  identifier: string;
  title?: string;
  image?: string;
  description?: string;
  hashtags: string[];
}

export function usePublishInterestSet() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateConfig } = useAppContext();

  return useMutation({
    mutationFn: async (params: PublishInterestSetParams) => {
      if (!user) {
        throw new Error('User must be logged in to publish interest sets');
      }

      const tags: string[][] = [['d', params.identifier]];

      if (params.title) {
        tags.push(['title', params.title]);
      }

      if (params.image) {
        tags.push(['image', params.image]);
      }

      if (params.description) {
        tags.push(['description', params.description]);
      }

      // Add hashtag tags
      for (const hashtag of params.hashtags) {
        tags.push(['t', hashtag.toLowerCase()]);
      }

      // Add client tag
      tags.push(['client', 'zelo.news']);

      const event = await user.signer.signEvent({
        kind: 30015,
        content: '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });

      return { event, params };
    },
    onSuccess: ({ params }) => {
      // Update local AppContext with the new interest set
      updateConfig((currentConfig) => {
        const currentSets = currentConfig.interestSetsMetadata?.sets || {};
        return {
          ...currentConfig,
          interestSetsMetadata: {
            sets: {
              ...currentSets,
              [params.identifier]: params.hashtags,
            },
            updatedAt: Math.floor(Date.now() / 1000),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['interest-sets'] });
      toast({
        title: 'Success',
        description: 'Interest set saved successfully',
      });
    },
    onError: (error) => {
      console.error('Failed to publish interest set:', error);
      toast({
        title: 'Error',
        description: 'Failed to save interest set. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
