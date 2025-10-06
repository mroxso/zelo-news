import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

/**
 * Hook to query available DVM service providers for TTS (kind 5250)
 * using NIP-89 announcements (kind 31990)
 */
export function useDVMProviders() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['dvm-providers', 'tts'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query for NIP-89 announcements for TTS (kind 5250)
      const events = await nostr.query(
        [{
          kinds: [31990],
          '#k': ['5250'], // TTS job kind
          limit: 50,
        }],
        { signal }
      );

      return events.map(event => {
        let metadata: { name?: string; about?: string; image?: string } = {};
        try {
          metadata = JSON.parse(event.content);
        } catch (error) {
          console.warn('Failed to parse DVM metadata:', error);
        }

        return {
          event,
          pubkey: event.pubkey,
          npub: nip19.npubEncode(event.pubkey),
          name: metadata.name || 'Unknown DVM',
          about: metadata.about || '',
          image: metadata.image,
        };
      });
    },
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to query TTS job results for a specific article
 */
export function useTTSJobs(articleEvent: NostrEvent | null) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['tts-jobs', articleEvent?.id],
    queryFn: async (c) => {
      if (!articleEvent) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // For addressable events (kind 30023), we need to query using the 'a' tag
      const identifier = articleEvent.tags.find(([name]) => name === 'd')?.[1] || '';
      const aTag = `${articleEvent.kind}:${articleEvent.pubkey}:${identifier}`;

      // Query for job results (kind 6250 = 5250 + 1000)
      const results = await nostr.query(
        [{
          kinds: [6250],
          '#a': [aTag],
          limit: 100,
        }],
        { signal }
      );

      // Filter out results that have valid audio URLs
      return results.filter(result => {
        // Check if content is a URL or if there's a URL in tags
        const content = result.content.trim();
        const urlTag = result.tags.find(([name]) => name === 'url')?.[1];
        return content.startsWith('http') || urlTag;
      }).map(result => {
        const amountTag = result.tags.find(([name]) => name === 'amount');
        const requestTag = result.tags.find(([name]) => name === 'request');
        const bolt11 = amountTag?.[2];
        
        return {
          event: result,
          audioUrl: result.content.trim().startsWith('http') 
            ? result.content.trim() 
            : result.tags.find(([name]) => name === 'url')?.[1] || '',
          provider: result.pubkey,
          providerNpub: nip19.npubEncode(result.pubkey),
          amountMillisats: amountTag?.[1] ? parseInt(amountTag[1]) : null,
          bolt11,
          requestEvent: requestTag?.[1],
          createdAt: result.created_at,
        };
      });
    },
    enabled: !!articleEvent?.id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to query job feedback for a specific job request
 */
export function useJobFeedback(jobRequestId: string | null) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['job-feedback', jobRequestId],
    queryFn: async (c) => {
      if (!jobRequestId) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const feedbackEvents = await nostr.query(
        [{
          kinds: [7000],
          '#e': [jobRequestId],
          limit: 50,
        }],
        { signal }
      );

      return feedbackEvents.map(feedback => {
        const statusTag = feedback.tags.find(([name]) => name === 'status');
        const amountTag = feedback.tags.find(([name]) => name === 'amount');
        
        return {
          event: feedback,
          provider: feedback.pubkey,
          status: statusTag?.[1] || 'unknown',
          statusInfo: statusTag?.[2] || '',
          amountMillisats: amountTag?.[1] ? parseInt(amountTag[1]) : null,
          bolt11: amountTag?.[2],
          content: feedback.content,
          createdAt: feedback.created_at,
        };
      }).sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: !!jobRequestId,
    refetchInterval: (query) => {
      // Keep refetching while we're waiting for results
      const data = query.state.data;
      if (!data || data.length === 0) return 5000; // 5 seconds
      
      const latestStatus = data[0]?.status;
      if (latestStatus === 'processing' || latestStatus === 'payment-required') {
        return 10000; // 10 seconds
      }
      
      return false; // Stop refetching
    },
  });
}

/**
 * Hook to request a new TTS job
 */
export function useRequestTTS() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeJobRequestId, setActiveJobRequestId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      articleEvent,
      providerPubkey,
      language = 'en',
    }: {
      articleEvent: NostrEvent;
      providerPubkey?: string;
      language?: string;
    }) => {
      if (!user) {
        throw new Error('You must be logged in to request TTS');
      }

      // Get article identifier for addressable event
      const identifier = articleEvent.tags.find(([name]) => name === 'd')?.[1] || '';
      const aTag = `${articleEvent.kind}:${articleEvent.pubkey}:${identifier}`;

      // Create job request event (kind 5250)
      const eventTemplate = {
        kind: 5250,
        content: '',
        tags: [
          ['i', aTag, 'event'], // Input is the article event
          ['param', 'language', language],
          ['output', 'audio/mpeg'], // Request MP3 output
        ] as string[][],
        created_at: Math.floor(Date.now() / 1000),
      };

      // Add provider tag if specified
      if (providerPubkey) {
        eventTemplate.tags.push(['p', providerPubkey]);
      }

      const signedEvent = await user.signer.signEvent(eventTemplate);
      await nostr.event(signedEvent);

      return signedEvent;
    },
    onSuccess: (signedEvent, variables) => {
      setActiveJobRequestId(signedEvent.id);
      
      // Invalidate TTS jobs query to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['tts-jobs', variables.articleEvent.id] 
      });

      toast({
        title: 'TTS Job Requested',
        description: 'Your text-to-speech job has been submitted. Service providers will process your request.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to request TTS',
        variant: 'destructive',
      });
    },
  });

  return {
    ...mutation,
    activeJobRequestId,
    clearActiveJob: () => setActiveJobRequestId(null),
  };
}
