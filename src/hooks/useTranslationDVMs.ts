import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * DVM service announcement metadata
 */
export interface DVMMetadata {
  name?: string;
  about?: string;
  image?: string;
  picture?: string;
}

/**
 * Translation DVM service provider
 */
export interface TranslationDVM {
  pubkey: string;
  event: NostrEvent;
  metadata: DVMMetadata;
  supportedKinds: string[];
  tags: string[];
}

/**
 * Hook to fetch available translation DVMs (kind 31990 with k:5002)
 * These are service providers that advertise translation capabilities
 */
export function useTranslationDVMs() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['translation-dvms'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for DVM service announcements (kind 31990) that support translation (k:5002)
      const events = await nostr.query(
        [
          {
            kinds: [31990], // NIP-89 service announcement
            '#k': ['5002'], // Translation job kind
            limit: 50,
          },
        ],
        { signal }
      );

      // Transform events into TranslationDVM objects
      const dvms: TranslationDVM[] = events.map((event) => {
        let metadata: DVMMetadata = {};
        
        try {
          if (event.content) {
            metadata = JSON.parse(event.content);
          }
        } catch (e) {
          // If content is not valid JSON, metadata stays empty
        }

        const supportedKinds = event.tags
          .filter(([name]) => name === 'k')
          .map(([, value]) => value);

        const tags = event.tags
          .filter(([name]) => name === 't')
          .map(([, value]) => value);

        return {
          pubkey: event.pubkey,
          event,
          metadata,
          supportedKinds,
          tags,
        };
      });

      return dvms;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
