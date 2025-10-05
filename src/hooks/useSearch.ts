import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

export interface SearchResult {
  type: 'profile' | 'article';
  event: NostrEvent;
}

export function useSearch(searchTerm: string, enabled = true) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const term = searchTerm.toLowerCase().trim();

      if (!term || term.length < 2) {
        return [];
      }

      // Check if the search term is a hashtag
      const isHashtagSearch = term.startsWith('#');
      const tagValue = isHashtagSearch ? term.slice(1) : term;

      // If hashtag search, query specifically for articles with that tag
      if (isHashtagSearch && tagValue) {
        const events = await nostr.query(
          [
            {
              kinds: [30023],
              '#t': [tagValue],
              limit: 100,
            },
          ],
          { signal }
        );

        return events.map((event) => ({ type: 'article' as const, event }));
      }

      // Regular search: Query both profiles (kind 0) and articles (kind 30023) in one request
      const events = await nostr.query(
        [
          {
            kinds: [0, 30023],
            limit: 100,
          },
        ],
        { signal }
      );

      const results: SearchResult[] = [];

      events.forEach((event) => {
        if (event.kind === 0) {
          // Profile search - check name, display_name, and nip05
          try {
            const metadata = JSON.parse(event.content);
            const name = metadata.name?.toLowerCase() || '';
            const displayName = metadata.display_name?.toLowerCase() || '';
            const nip05 = metadata.nip05?.toLowerCase() || '';
            const about = metadata.about?.toLowerCase() || '';

            if (
              name.includes(term) ||
              displayName.includes(term) ||
              nip05.includes(term) ||
              about.includes(term)
            ) {
              results.push({ type: 'profile', event });
            }
          } catch {
            // Invalid JSON, skip this profile
          }
        } else if (event.kind === 30023) {
          // Article search - check title, summary, and content
          const title = event.tags.find(([name]) => name === 'title')?.[1]?.toLowerCase() || '';
          const summary = event.tags.find(([name]) => name === 'summary')?.[1]?.toLowerCase() || '';
          const content = event.content.toLowerCase();

          if (title.includes(term) || summary.includes(term) || content.includes(term)) {
            results.push({ type: 'article', event });
          }
        }
      });

      // Sort results: prioritize exact matches in titles/names
      results.sort((a, b) => {
        if (a.type === 'profile' && b.type === 'profile') {
          const aMetadata = JSON.parse(a.event.content);
          const bMetadata = JSON.parse(b.event.content);
          const aName = aMetadata.name?.toLowerCase() || '';
          const bName = bMetadata.name?.toLowerCase() || '';
          
          const aExact = aName === term ? 1 : 0;
          const bExact = bName === term ? 1 : 0;
          
          return bExact - aExact;
        }
        if (a.type === 'article' && b.type === 'article') {
          const aTitle = a.event.tags.find(([name]) => name === 'title')?.[1]?.toLowerCase() || '';
          const bTitle = b.event.tags.find(([name]) => name === 'title')?.[1]?.toLowerCase() || '';
          
          const aExact = aTitle.includes(term) ? 1 : 0;
          const bExact = bTitle.includes(term) ? 1 : 0;
          
          return bExact - aExact;
        }
        // Articles before profiles
        return a.type === 'article' ? -1 : 1;
      });

      // Limit to top 10 results
      return results.slice(0, 10);
    },
    enabled: enabled && searchTerm.length >= 2,
  });
}
