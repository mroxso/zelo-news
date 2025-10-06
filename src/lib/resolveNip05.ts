/**
 * Resolves a NIP-05 identifier to a public key (hex format).
 * 
 * According to NIP-05, this function:
 * 1. Splits the identifier into <local-part> and <domain>
 * 2. Makes a GET request to https://<domain>/.well-known/nostr.json?name=<local-part>
 * 3. Returns the public key from the "names" mapping
 * 
 * @param nip05 - NIP-05 identifier (e.g., "bob@example.com")
 * @returns The public key in hex format, or null if resolution fails
 */
export async function resolveNip05(nip05: string): Promise<string | null> {
  try {
    const [localPart, domain] = nip05.split('@');
    
    if (!localPart || !domain) {
      return null;
    }

    // Build the well-known URL
    const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(localPart)}`;

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error', // NIP-05 spec: MUST NOT return any HTTP redirects
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Check if the names mapping exists and contains the local part
    if (data.names && typeof data.names === 'object') {
      const pubkey = data.names[localPart];
      
      if (typeof pubkey === 'string' && pubkey.length === 64) {
        // Validate it's a valid hex string
        if (/^[0-9a-f]{64}$/i.test(pubkey)) {
          return pubkey.toLowerCase();
        }
      }
    }

    return null;
  } catch (error) {
    // Network error, timeout, or invalid JSON
    console.error('Failed to resolve NIP-05:', error);
    return null;
  }
}
