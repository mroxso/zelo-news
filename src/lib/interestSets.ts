import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Represents a parsed interest set with all metadata
 */
export interface ParsedInterestSet {
  id: string;
  identifier: string;
  title?: string;
  image?: string;
  description?: string;
  hashtags: string[];
  createdAt: number;
}

/**
 * Represents interest set data stored in AppConfig
 * Includes full metadata to avoid duplication between NostrSync and useInterestSets
 */
export interface InterestSetData {
  hashtags: string[];
  title?: string;
  image?: string;
  description?: string;
}

/**
 * Parses a Nostr event (kind 30015) into a ParsedInterestSet object
 */
export function parseInterestSetEvent(event: NostrEvent): ParsedInterestSet {
  const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const description = event.tags.find(([name]) => name === 'description')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, value]) => value);

  return {
    id: event.id,
    identifier,
    title,
    image,
    description,
    hashtags,
    createdAt: event.created_at,
  };
}

/**
 * Deduplicates interest set events by 'd' tag identifier, keeping only the most recent event
 * @param events - Array of kind 30015 events
 * @returns Map of identifier to the most recent event
 */
export function deduplicateInterestSetEvents(events: NostrEvent[]): Map<string, NostrEvent> {
  const eventsByIdentifier = new Map<string, NostrEvent>();
  
  for (const event of events) {
    const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
    const existing = eventsByIdentifier.get(identifier);
    if (!existing || event.created_at > existing.created_at) {
      eventsByIdentifier.set(identifier, event);
    }
  }
  
  return eventsByIdentifier;
}

/**
 * Gets the most recent timestamp from a collection of events
 * @param events - Array of Nostr events
 * @returns The most recent created_at timestamp, or 0 if no events
 */
export function getLatestTimestamp(events: NostrEvent[]): number {
  return events.reduce((latest, event) => 
    event.created_at > latest ? event.created_at : latest, 0);
}

/**
 * Converts deduplicated events to the InterestSetData format for AppConfig storage
 * @param eventsByIdentifier - Map of identifier to event
 * @returns Record of identifier to InterestSetData
 */
export function eventsToInterestSetData(eventsByIdentifier: Map<string, NostrEvent>): Record<string, InterestSetData> {
  const result: Record<string, InterestSetData> = {};
  
  for (const [identifier, event] of eventsByIdentifier) {
    const parsed = parseInterestSetEvent(event);
    
    // Only include sets that have hashtags or metadata
    if (parsed.hashtags.length > 0 || parsed.title || parsed.image || parsed.description) {
      result[identifier] = {
        hashtags: parsed.hashtags,
        title: parsed.title,
        image: parsed.image,
        description: parsed.description,
      };
    }
  }
  
  return result;
}
