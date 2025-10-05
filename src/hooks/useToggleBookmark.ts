import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useBookmarkEvent } from './useBookmarks';
import { useNostrPublish } from './useNostrPublish';

/**
 * Hook to toggle a bookmark for an article.
 * Publishes a kind 10003 event with the updated bookmarks list.
 */
export function useToggleBookmark() {
  const { user } = useCurrentUser();
  const { data: bookmarkEvent } = useBookmarkEvent();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleCoordinate }: { articleCoordinate: string }) => {
      if (!user) {
        throw new Error('Must be logged in to bookmark');
      }

      // Get existing bookmarks from the current bookmark event
      const existingTags = bookmarkEvent?.tags || [];
      
      // Filter out 'a' tags to get articles
      const articleTags = existingTags.filter((tag) => tag[0] === 'a');
      const otherTags = existingTags.filter((tag) => tag[0] !== 'a');

      // Check if this article is already bookmarked
      const isBookmarked = articleTags.some((tag) => tag[1] === articleCoordinate);

      let newArticleTags: string[][];
      
      if (isBookmarked) {
        // Remove the bookmark
        newArticleTags = articleTags.filter((tag) => tag[1] !== articleCoordinate);
      } else {
        // Add the bookmark
        newArticleTags = [...articleTags, ['a', articleCoordinate]];
      }

      // Combine all tags
      const allTags = [...otherTags, ...newArticleTags];

      // Create and publish the updated bookmark event
      const event = await publishEvent({
        kind: 10003,
        content: '',
        tags: allTags,
        created_at: Math.floor(Date.now() / 1000),
      });

      return { event, isBookmarked: !isBookmarked };
    },
    onSuccess: () => {
      // Invalidate bookmark queries to refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['bookmark-event'] });
    },
  });
}
