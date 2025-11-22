import { useSeoMeta } from '@unhead/react';
import { SearchBar } from '@/components/SearchBar';
import { LatestArticles } from '@/components/LatestArticles';
import { LatestInHashtag } from '@/components/LatestInHashtag';
import { TrendingTags } from '@/components/TrendingTags';
import { Music, Leaf, BrainCircuit, Bitcoin, Newspaper, Hash } from 'lucide-react';
import { useInterestSets } from '@/hooks/useInterestSets';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function HomePage() {
  const { user } = useCurrentUser();
  const { data: interestSets } = useInterestSets();

  useSeoMeta({
    title: 'zelo.news - Decentralized News on Nostr',
    description: 'Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.',
    ogTitle: 'zelo.news - Decentralized News on Nostr',
    ogDescription: 'Your source for decentralized news and articles on the Nostr protocol. Read, publish, and discover content from the Nostr network.',
    ogType: 'website',
    ogUrl: window.location.href,
    ogImage: `${window.location.origin}/icon-512.png`,
    ogSiteName: 'zelo.news',
    twitterCard: 'summary_large_image',
    twitterTitle: 'zelo.news - Decentralized News on Nostr',
    twitterDescription: 'Your source for decentralized news and articles on the Nostr protocol.',
    twitterImage: `${window.location.origin}/icon-512.png`,
    twitterSite: '@zelo_news',
  });

  // Default hashtags to show when user is logged out or has no interest sets
  const defaultHashtags = [
    { hashtag: 'news', icon: <Newspaper className="h-6 w-6 text-primary" /> },
    { hashtag: 'music', icon: <Music className="h-6 w-6 text-primary" /> },
    { hashtag: 'nature', icon: <Leaf className="h-6 w-6 text-primary" /> },
    { hashtag: 'ai', icon: <BrainCircuit className="h-6 w-6 text-primary" /> },
    { hashtag: 'bitcoin', icon: <Bitcoin className="h-6 w-6 text-primary" /> },
  ];

  // Use interest sets if user is logged in and has sets, otherwise use defaults
  const displaySets = user && interestSets && interestSets.length > 0
    ? interestSets
    : null;

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Search bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>

        {/* Trending Tags */}
        <TrendingTags />

        {/* Latest Articles */}
        <LatestArticles />

        {/* Display interest sets or default hashtags */}
        {displaySets ? (
          // User's custom interest sets - show first hashtag from each set
          displaySets
            .filter((set) => set.hashtags.length > 0)
            .map((set) => {
              const primaryHashtag = set.hashtags[0];
              return (
                <LatestInHashtag
                  key={set.id}
                  hashtag={primaryHashtag}
                  icon={<Hash className="h-6 w-6 text-primary" />}
                  title={set.title || `Latest in #${primaryHashtag}`}
                />
              );
            })
        ) : (
          // Default hashtags for logged-out users or users without interest sets
          defaultHashtags.map(({ hashtag, icon }) => (
            <LatestInHashtag key={hashtag} hashtag={hashtag} icon={icon} />
          ))
        )}
      </div>
    </div>
  );
}
