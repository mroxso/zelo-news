import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Represents a validated Nostr highlight event (NIP-84)
 */
export interface HighlightEvent extends NostrEvent {
  kind: 9802;
}

/**
 * Validates that a Nostr event is a valid NIP-84 highlight (kind:9802)
 * 
 * Requirements:
 * - Must be kind 9802
 * - Must have at least one reference tag (a, e, or r)
 * - Content may be empty (for non-text media highlights)
 * 
 * @param event - The Nostr event to validate
 * @returns true if the event is a valid highlight, false otherwise
 */
export function validateHighlight(event: NostrEvent): event is HighlightEvent {
  // Must be kind 9802
  if (event.kind !== 9802) return false;

  // Must have at least one reference tag (a, e, or r)
  const hasReference = event.tags.some(([name]) => 
    name === 'a' || name === 'e' || name === 'r'
  );

  if (!hasReference) return false;

  return true;
}

/**
 * Extracts the source reference from a highlight event
 * 
 * @param highlight - The highlight event
 * @returns The source reference object or null
 */
export function getHighlightSource(highlight: HighlightEvent): {
  type: 'event' | 'address' | 'url';
  value: string;
} | null {
  // Check for 'a' tag (addressable event)
  const aTag = highlight.tags.find(([name]) => name === 'a');
  if (aTag && aTag[1]) {
    return { type: 'address', value: aTag[1] };
  }

  // Check for 'e' tag (event ID)
  const eTag = highlight.tags.find(([name]) => name === 'e');
  if (eTag && eTag[1]) {
    return { type: 'event', value: eTag[1] };
  }

  // Check for 'r' tag (URL)
  const rTag = highlight.tags.find(([name]) => name === 'r');
  if (rTag && rTag[1]) {
    return { type: 'url', value: rTag[1] };
  }

  return null;
}

/**
 * Gets the comment from a quote highlight
 * 
 * @param highlight - The highlight event
 * @returns The comment text or null if no comment exists
 */
export function getHighlightComment(highlight: HighlightEvent): string | null {
  const commentTag = highlight.tags.find(([name]) => name === 'comment');
  return commentTag?.[1] || null;
}

/**
 * Gets the context text from a highlight
 * 
 * @param highlight - The highlight event
 * @returns The context text or null if no context exists
 */
export function getHighlightContext(highlight: HighlightEvent): string | null {
  const contextTag = highlight.tags.find(([name]) => name === 'context');
  return contextTag?.[1] || null;
}

/**
 * Gets all author pubkeys from a highlight event
 * 
 * @param highlight - The highlight event
 * @returns Array of author pubkeys
 */
export function getHighlightAuthors(highlight: HighlightEvent): string[] {
  return highlight.tags
    .filter(([name, , , role]) => name === 'p' && role === 'author')
    .map(([, pubkey]) => pubkey)
    .filter(Boolean);
}

/**
 * Checks if a highlight is a quote highlight (has a comment)
 * 
 * @param highlight - The highlight event
 * @returns true if the highlight has a comment, false otherwise
 */
export function isQuoteHighlight(highlight: HighlightEvent): boolean {
  return highlight.tags.some(([name]) => name === 'comment');
}

/**
 * Cleans tracking parameters from a URL
 * 
 * @param url - The URL to clean
 * @returns The cleaned URL string
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // List of common tracking parameters to remove
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'source',
      'campaign',
      'mc_cid',
      'mc_eid',
    ];

    // Remove tracking parameters
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}
