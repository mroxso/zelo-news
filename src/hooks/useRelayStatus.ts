import { useState, useEffect } from 'react';
import { useNostr } from '@nostrify/react';

export type RelayStatus = 'connected' | 'disconnected' | 'connecting';

export function useRelayStatus(relayUrl: string): RelayStatus {
  const { nostr } = useNostr();
  const [status, setStatus] = useState<RelayStatus>('connecting');

  useEffect(() => {
    let mounted = true;
    let ws: WebSocket | undefined;

    const checkConnection = async () => {
      try {
        // Get the relay instance
        const relay = nostr.relay(relayUrl);
        
        // Try to establish a connection by making a simple query
        const signal = AbortSignal.timeout(3000);
        await relay.query([{ kinds: [0], limit: 1 }], { signal });
        
        if (mounted) {
          setStatus('connected');
        }
      } catch {
        if (mounted) {
          setStatus('disconnected');
        }
      }
    };

    // Initial connection check
    checkConnection();

    // Set up periodic connection checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [relayUrl, nostr]);

  return status;
}
