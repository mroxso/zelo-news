import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { validateHighlight } from '@/lib/validators';

/**
 * Hook to fetch all highlights created by a specific user
 * 
 * @param pubkey - The public key of the user
 * @param options - Query options
 * @returns Query result with array of validated highlight events
 * 
 * @example
 * ```tsx
 * const { data: highlights, isLoading } = useUserHighlights(userPubkey);
 * ```
 */
export function useUserHighlights(
  pubkey: string,
  options?: {
    enabled?: boolean;
    limit?: number;
    staleTime?: number;
  }
) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-highlights', pubkey, options?.limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for highlights by this user
      const events = await nostr.query(
        [
          {
            kinds: [9802],
            authors: [pubkey],
            limit: options?.limit ?? 100,
          },
        ],
        { signal }
      );

      // Filter and validate highlights
      const validHighlights = events.filter(validateHighlight);

      // Sort by created_at (newest first)
      return validHighlights.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey && (options?.enabled ?? true),
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
