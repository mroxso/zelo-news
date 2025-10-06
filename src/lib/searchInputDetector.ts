import { nip19 } from 'nostr-tools';

export type SearchInputType = 
  | { type: 'npub'; value: string }
  | { type: 'nprofile'; value: string }
  | { type: 'naddr'; value: string }
  | { type: 'note'; value: string }
  | { type: 'nevent'; value: string }
  | { type: 'nip05'; value: string }
  | { type: 'hashtag'; value: string }
  | { type: 'search'; value: string };

/**
 * Detects the type of search input and returns the appropriate type and value.
 * This function checks for NIP-19 identifiers, NIP-05 addresses, hashtags, and regular search terms.
 */
export function detectSearchInputType(input: string): SearchInputType {
  const trimmed = input.trim();

  if (!trimmed) {
    return { type: 'search', value: trimmed };
  }

  // Check for hashtag
  if (trimmed.startsWith('#')) {
    return { type: 'hashtag', value: trimmed };
  }

  // Check for NIP-19 identifiers (npub, nprofile, naddr, note, nevent)
  if (trimmed.startsWith('npub1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'npub') {
        return { type: 'npub', value: trimmed };
      }
    } catch {
      // Invalid npub, fall through to search
    }
  }

  if (trimmed.startsWith('nprofile1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'nprofile') {
        return { type: 'nprofile', value: trimmed };
      }
    } catch {
      // Invalid nprofile, fall through to search
    }
  }

  if (trimmed.startsWith('naddr1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'naddr') {
        return { type: 'naddr', value: trimmed };
      }
    } catch {
      // Invalid naddr, fall through to search
    }
  }

  if (trimmed.startsWith('note1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'note') {
        return { type: 'note', value: trimmed };
      }
    } catch {
      // Invalid note, fall through to search
    }
  }

  if (trimmed.startsWith('nevent1')) {
    try {
      const decoded = nip19.decode(trimmed);
      if (decoded.type === 'nevent') {
        return { type: 'nevent', value: trimmed };
      }
    } catch {
      // Invalid nevent, fall through to search
    }
  }

  // Check for NIP-05 identifier (email-like format)
  // NIP-05 format: <local-part>@<domain>
  // local-part is restricted to a-z0-9-_.
  const nip05Regex = /^[a-z0-9-_.]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  if (nip05Regex.test(trimmed)) {
    return { type: 'nip05', value: trimmed };
  }

  // Default to regular search
  return { type: 'search', value: trimmed };
}
