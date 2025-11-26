import { useEffect } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAppContext } from '@/hooks/useAppContext';

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
          // Deduplicate by 'd' tag identifier, keeping only the most recent event
          const eventsByIdentifier = new Map<string, typeof events[0]>();
          for (const event of events) {
            const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
            const existing = eventsByIdentifier.get(identifier);
            if (!existing || event.created_at > existing.created_at) {
              eventsByIdentifier.set(identifier, event);
            }
          }

          // Build interest sets map: identifier -> hashtags array
          const interestSets: Record<string, string[]> = {};
          for (const [identifier, event] of eventsByIdentifier) {
            const hashtags = event.tags
              .filter(([name]) => name === 't')
              .map(([, value]) => value);
            
            if (hashtags.length > 0) {
              interestSets[identifier] = hashtags;
            }
          }

          console.log('Syncing interest sets from Nostr:', interestSets);
          updateConfig((current) => ({
            ...current,
            interestSets,
          }));
        }
      } catch (error) {
        console.error('Failed to sync interest sets from Nostr:', error);
      }
    };

    syncInterestSetsFromNostr();
  }, [user, nostr, updateConfig]);

  return null;
}