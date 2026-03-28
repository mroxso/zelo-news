import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

export type RelayStatus = 'connected' | 'disconnected' | 'connecting';

export function useRelayStatus(relayUrl: string): RelayStatus {
  const { nostr } = useNostr();

  const { status, isFetching, isError } = useQuery<"connected">({
    queryKey: ['relayStatus', relayUrl],
    queryFn: async ({ signal }) => {
      const relay = nostr.relay(relayUrl);
      const timeout = AbortSignal.timeout(3000);
      await relay.query([{ kinds: [0], limit: 1 }], { signal: AbortSignal.any([signal, timeout]) });
      return 'connected' as const;
    },
    refetchInterval: 30000,
    retry: false,
    // initialData: 'connecting', // Not needed, handled below
  });

  if (isFetching) return 'connecting';
  if (isError) return 'disconnected';
  if (status === 'success') return 'connected';
  return 'connecting';
}
