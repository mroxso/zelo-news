import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';

interface BlogPostData {
  identifier: string;
  title: string;
  summary?: string;
  image?: string;
  content: string;
  hashtags?: string[];
  publishedAt?: number;
}

/**
 * Hook to publish or update a blog post (kind 30023)
 */
export function usePublishBlogPost() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlogPostData) => {
      if (!user) {
        throw new Error('You must be logged in to publish a blog post');
      }

      const tags: string[][] = [
        ['d', data.identifier],
        ['title', data.title],
      ];

      if (data.summary) {
        tags.push(['summary', data.summary]);
      }

      if (data.image) {
        tags.push(['image', data.image]);
      }

      if (data.publishedAt) {
        tags.push(['published_at', data.publishedAt.toString()]);
      }

      if (data.hashtags && data.hashtags.length > 0) {
        data.hashtags.forEach(tag => {
          tags.push(['t', tag]);
        });
      }

      // Add client tag
      // tags.push(['client', 'zelo.news']);

      const eventTemplate = {
        kind: 30023,
        content: data.content,
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      const signedEvent = await user.signer.signEvent(eventTemplate);
      await nostr.event(signedEvent);

      return signedEvent;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Blog post published successfully',
      });
      
      // Invalidate blog posts query to refetch
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish blog post',
        variant: 'destructive',
      });
    },
  });
}
