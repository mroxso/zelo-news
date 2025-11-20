import type { NostrEvent } from '@nostrify/nostrify';

export interface ClientTagInfo {
  name: string;
  address?: string; // 31990:pubkey:d-identifier
  relay?: string;
}

/**
 * Extracts and parses the client tag from a Nostr event according to NIP-89
 * 
 * Client tag format: ["client", "My Client", "31990:app-pubkey:<d-identifier>", "wss://relay"]
 * - First element: tag name "client"
 * - Second element: client name (required)
 * - Third element: handler address (optional)
 * - Fourth element: relay hint (optional)
 * 
 * @param event - The Nostr event to extract the client tag from
 * @returns ClientTagInfo if a client tag exists, undefined otherwise
 */
export function parseClientTag(event: NostrEvent): ClientTagInfo | undefined {
  const clientTag = event.tags.find(([name]) => name === 'client');
  
  if (!clientTag || clientTag.length < 2) {
    return undefined;
  }

  const [, name, address, relay] = clientTag;

  if (!name) {
    return undefined;
  }

  return {
    name,
    address: address || undefined,
    relay: relay || undefined,
  };
}
