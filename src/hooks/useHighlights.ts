import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { validateHighlight } from '@/lib/validators';

/**
 * Hook to fetch highlights for a specific article or event
 * 
 * @param eventId - The ID of the article/event to get highlights for
 * @param options - Query options
 * @returns Query result with array of validated highlight events
 * 
 * @example
 * ```tsx
 * const { data: highlights, isLoading } = useHighlights(article.id);
 * ```
 */
export function useHighlights(
  eventId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['highlights', eventId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for highlights that reference this event
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            '#e': [eventId],
            limit: 150,
          },
        ],
        { signal }
      );

      // Filter and validate highlights
      const validHighlights = events.filter(validateHighlight);

      // Sort by created_at (newest first)
      return validHighlights.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!eventId && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch highlights for an addressable event (like NIP-23 articles)
 * 
 * @param aTag - The 'a' tag value (e.g., "30023:pubkey:d-tag")
 * @param options - Query options
 * @returns Query result with array of validated highlight events
 * 
 * @example
 * ```tsx
 * const aTag = `30023:${article.pubkey}:${dTag}`;
 * const { data: highlights } = useHighlightsByAddress(aTag);
 * ```
 */
export function useHighlightsByAddress(
  aTag: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['highlights-by-address', aTag],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for highlights that reference this addressable event
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            '#a': [aTag],
            limit: 150,
          },
        ],
        { signal }
      );

      // Filter and validate highlights
      const validHighlights = events.filter(validateHighlight);

      // Sort by created_at (newest first)
      return validHighlights.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!aTag && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Combined hook that queries highlights for both event ID and addressable event
 * Useful for NIP-23 articles which are addressable events
 * 
 * @param article - The article event to get highlights for
 * @param options - Query options
 * @returns Query result with array of validated highlight events
 * 
 * @example
 * ```tsx
 * const { data: highlights } = useArticleHighlights(article);
 * ```
 */
export function useArticleHighlights(
  article: NostrEvent | null | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { nostr } = useNostr();

  // Build the 'a' tag for addressable events
  const aTag = article?.kind === 30023
    ? (() => {
        const dTag = article.tags.find(([name]) => name === 'd')?.[1];
        return dTag ? `${article.kind}:${article.pubkey}:${dTag}` : null;
      })()
    : null;

  return useQuery({
    queryKey: ['article-highlights', article?.id, aTag],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      if (!article) return [];

      const filters: Array<{
        kinds: number[];
        '#e'?: string[];
        '#a'?: string[];
        limit: number;
      }> = [];

      // Add filter for event ID
      if (article.id) {
        filters.push({
          kinds: [9802],
          '#e': [article.id],
          limit: 150,
        });
      }

      // Add filter for addressable event
      if (aTag) {
        filters.push({
          kinds: [9802],
          '#a': [aTag],
          limit: 150,
        });
      }

      if (filters.length === 0) return [];

      // Query for highlights
      const events = await nostr.query(filters, { signal });

      // Filter and validate highlights, remove duplicates
      const validHighlights = events.filter(validateHighlight);
      const uniqueHighlights = Array.from(
        new Map(validHighlights.map(h => [h.id, h])).values()
      );

      // Sort by created_at (newest first)
      return uniqueHighlights.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!article && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
