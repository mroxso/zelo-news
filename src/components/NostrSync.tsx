import { useEffect } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppContext } from '@/hooks/useAppContext';
import { deduplicateInterestSetEvents, getLatestTimestamp, eventsToInterestSetData } from '@/lib/interestSets';

/**
 * NostrSync - Syncs user's Nostr data
 *
 * This component runs globally to sync various Nostr data when the user logs in.
 * Currently syncs:
 * - NIP-65 relay list (kind 10002)
 * - Interest sets (kind 30015)
 */
export function NostrSync() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { config, updateConfig } = useAppContext();

  useEffect(() => {
    if (!user) return;

    const syncRelaysFromNostr = async () => {
      try {
        const events = await nostr.query(
          [{ kinds: [10002], authors: [user.pubkey], limit: 1 }],
          { signal: AbortSignal.timeout(5000) }
        );

        if (events.length > 0) {
          const event = events[0];

          // Only update if the event is newer than our stored data
          if (event.created_at > config.relayMetadata.updatedAt) {
            const fetchedRelays = event.tags
              .filter(([name]) => name === 'r')
              .map(([_, url, marker]) => ({
                url,
                read: !marker || marker === 'read',
                write: !marker || marker === 'write',
              }));

            if (fetchedRelays.length > 0) {
              console.log('Syncing relay list from Nostr:', fetchedRelays);
              updateConfig((current) => ({
                ...current,
                relayMetadata: {
                  relays: fetchedRelays,
                  updatedAt: event.created_at,
                },
              }));
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync relays from Nostr:', error);
      }
    };

    syncRelaysFromNostr();
  }, [user, config.relayMetadata.updatedAt, nostr, updateConfig]);

  // Sync interest sets from Nostr
  useEffect(() => {
    if (!user) return;

    const syncInterestSetsFromNostr = async () => {
      try {
        const events = await nostr.query(
          [{ kinds: [30015], authors: [user.pubkey] }],
          { signal: AbortSignal.timeout(5000) }
        );

        if (events.length > 0) {
          // Use shared utility to deduplicate events by 'd' tag identifier
          const eventsByIdentifier = deduplicateInterestSetEvents(events);
          const latestTimestamp = getLatestTimestamp(events);

          // Only update if the events are newer than our stored data
          if (latestTimestamp > config.interestSetsMetadata.updatedAt) {
            // Convert events to InterestSetData format with full metadata
            const interestSets = eventsToInterestSetData(eventsByIdentifier);

            console.log('Syncing interest sets from Nostr:', interestSets);
            updateConfig((current) => ({
              ...current,
              interestSetsMetadata: {
                sets: interestSets,
                updatedAt: latestTimestamp,
              },
            }));
          }
        } else {
          // Clear interest sets when none exist
          if (Object.keys(config.interestSetsMetadata.sets).length > 0) {
            updateConfig((current) => ({
              ...current,
              interestSetsMetadata: {
                sets: {},
                updatedAt: Date.now() / 1000,
              },
            }));
          }
        }
      } catch (error) {
        console.error('Failed to sync interest sets from Nostr:', error);
      }
    };

    syncInterestSetsFromNostr();
  }, [user, config.interestSetsMetadata.updatedAt, config.interestSetsMetadata.sets, nostr, updateConfig]);

  return null;
}