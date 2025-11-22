/**
 * Deduplicates an array of events by their ID.
 * @param events - Array of events with optional id property
 * @returns Deduplicated array of events
 */
export function deduplicateEvents<T extends { id?: string }>(events: T[]): T[] {
  const seen = new Set<string>();
  return events.filter(event => {
    if (!event.id || seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}
