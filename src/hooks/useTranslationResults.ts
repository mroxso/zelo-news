import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Translation result with metadata
 */
export interface TranslationResult {
  /** The result event (kind 6002) */
  event: NostrEvent;
  /** The original job request event stringified */
  request?: NostrEvent;
  /** The translated content */
  content: string;
  /** Service provider pubkey */
  provider: string;
  /** Target language from the original request */
  language?: string;
  /** Payment amount requested in millisats */
  amount?: string;
  /** Bolt11 invoice if payment is required */
  bolt11?: string;
  /** Creation timestamp */
  created_at: number;
}

/**
 * Job feedback event with status
 */
export interface TranslationFeedback {
  /** The feedback event (kind 7000) */
  event: NostrEvent;
  /** Status of the job */
  status: 'payment-required' | 'processing' | 'error' | 'success' | 'partial';
  /** Additional status info */
  statusInfo?: string;
  /** Service provider pubkey */
  provider: string;
  /** Payment amount if required */
  amount?: string;
  /** Bolt11 invoice if payment is required */
  bolt11?: string;
  /** Partial content if status is 'partial' */
  content?: string;
}

/**
 * Hook to fetch translation results for a specific article/event
 * Queries for both job results (kind 6002) and job feedback (kind 7000)
 */
export function useTranslationResults(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['translation-results', eventId],
    queryFn: async (c) => {
      if (!eventId) {
        return { results: [], feedback: [] };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for translation results (kind 6002) and feedback (kind 7000)
      // that reference this article
      const events = await nostr.query(
        [
          {
            kinds: [6002, 7000], // Translation results and feedback
            '#e': [eventId], // References the original article
            limit: 100,
          },
        ],
        { signal }
      );

      // Separate results from feedback
      const resultEvents = events.filter((e) => e.kind === 6002);
      const feedbackEvents = events.filter((e) => e.kind === 7000);

      // Parse translation results
      const results: TranslationResult[] = resultEvents.map((event) => {
        const requestTag = event.tags.find(([name]) => name === 'request');
        const amountTag = event.tags.find(([name]) => name === 'amount');

        let request: NostrEvent | undefined;
        let language: string | undefined;

        if (requestTag && requestTag[1]) {
          try {
            request = JSON.parse(requestTag[1]);
            // Extract language from the request params
            const paramTag = request?.tags.find(
              ([name, key]) => name === 'param' && key === 'language'
            );
            language = paramTag?.[2];
          } catch (e) {
            // If request parsing fails, continue without it
          }
        }

        return {
          event,
          request,
          content: event.content,
          provider: event.pubkey,
          language,
          amount: amountTag?.[1],
          bolt11: amountTag?.[2],
          created_at: event.created_at,
        };
      });

      // Parse feedback events
      const feedback: TranslationFeedback[] = feedbackEvents.map((event) => {
        const statusTag = event.tags.find(([name]) => name === 'status');
        const amountTag = event.tags.find(([name]) => name === 'amount');

        const status = (statusTag?.[1] || 'processing') as TranslationFeedback['status'];
        const statusInfo = statusTag?.[2];

        return {
          event,
          status,
          statusInfo,
          provider: event.pubkey,
          amount: amountTag?.[1],
          bolt11: amountTag?.[2],
          content: event.content || undefined,
        };
      });

      // Sort results by creation time (newest first)
      results.sort((a, b) => b.created_at - a.created_at);

      return { results, feedback };
    },
    enabled: !!eventId,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new results
  });
}
