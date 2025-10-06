import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useNostrPublish } from './useNostrPublish';
import { cleanUrl } from '@/lib/validators';

export interface PublishHighlightParams {
  /** The highlighted text content */
  content: string;
  /** The source article (Nostr event) */
  article?: NostrEvent;
  /** URL source (if not a Nostr event) */
  url?: string;
  /** Optional surrounding paragraph for context */
  context?: string;
  /** Optional comment for quote highlights */
  comment?: string;
  /** Additional author pubkeys to credit */
  additionalAuthors?: string[];
}

/**
 * Hook to publish a highlight (NIP-84 kind:9802) event
 * 
 * @example
 * ```tsx
 * const { mutate: publishHighlight } = usePublishHighlight();
 * 
 * publishHighlight({
 *   content: selectedText,
 *   article: article,
 *   comment: "This is insightful!"
 * });
 * ```
 */
export function usePublishHighlight() {
  const { mutateAsync: publish } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: PublishHighlightParams) => {
      const { content, article, url, context, comment, additionalAuthors = [] } = params;

      // Validate that we have either an article or URL
      if (!article && !url) {
        throw new Error('Must provide either article or url');
      }

      const tags: string[][] = [];

      // Add reference tags
      if (article) {
        // For addressable events (kind 30023 articles), use 'a' tag
        if (article.kind === 30023) {
          const dTag = article.tags.find(([name]) => name === 'd')?.[1];
          if (dTag) {
            tags.push(['a', `${article.kind}:${article.pubkey}:${dTag}`]);
          }
        } else {
          // For other events, use 'e' tag
          tags.push(['e', article.id]);
        }

        // Add author attribution
        tags.push(['p', article.pubkey, '', 'author']);
      } else if (url) {
        // Clean and add URL reference
        const cleanedUrl = cleanUrl(url);
        tags.push(['r', cleanedUrl, comment ? 'source' : '']);
      }

      // Add additional authors
      additionalAuthors.forEach(pubkey => {
        tags.push(['p', pubkey, '', 'author']);
      });

      // Add context if provided
      if (context) {
        tags.push(['context', context]);
      }

      // Add comment if provided (makes it a quote highlight)
      if (comment) {
        tags.push(['comment', comment]);
      }

      // Add alt text for accessibility (NIP-31)
      const altText = comment
        ? `Quote Highlight: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}" - ${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}`
        : `Highlight: "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"`;
      tags.push(['alt', altText]);

      // Publish the highlight event
      const event = await publish({
        kind: 9802,
        content: content,
        tags: tags,
      });

      return event;
    },
    onSuccess: (event, variables) => {
      // Invalidate relevant queries to refresh highlights
      if (variables.article) {
        queryClient.invalidateQueries({ queryKey: ['highlights', variables.article.id] });
      }
      // Also invalidate user highlights query
      queryClient.invalidateQueries({ queryKey: ['user-highlights', event.pubkey] });
    },
  });
}
