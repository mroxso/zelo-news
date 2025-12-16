import { useMutation } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Parameters for creating a translation job
 */
export interface TranslationJobParams {
  /** The event ID to translate */
  eventId: string;
  /** Target language code (ISO 639-2 or ISO 639-1) */
  language: string;
  /** Optional: specific DVM pubkey to send the job to */
  dvmPubkey?: string;
  /** Optional: relay hint where the event can be found */
  relayHint?: string;
  /** Optional: maximum bid in millisats */
  bid?: number;
}

/**
 * Hook to create and publish translation job requests (kind 5002)
 */
export function useTranslationJob() {
  const { mutate: createEvent, mutateAsync: createEventAsync } = useNostrPublish();

  return useMutation({
    mutationFn: async (params: TranslationJobParams) => {
      const { eventId, language, dvmPubkey, relayHint, bid } = params;

      const tags: string[][] = [
        ['i', eventId, 'event', relayHint || '', ''],
        ['param', 'language', language],
        ['output', 'text/plain'],
      ];

      // Add optional DVM pubkey if specified
      if (dvmPubkey) {
        tags.push(['p', dvmPubkey]);
      }

      // Add optional bid if specified
      if (bid) {
        tags.push(['bid', bid.toString()]);
      }

      // Create the job request event
      const jobRequest = {
        kind: 5002,
        content: '',
        tags,
      };

      // Publish the job request
      return new Promise<NostrEvent>((resolve, reject) => {
        createEvent(jobRequest, {
          onSuccess: (event) => resolve(event),
          onError: (error) => reject(error),
        });
      });
    },
  });
}
