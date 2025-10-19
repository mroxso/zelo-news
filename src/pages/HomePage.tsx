import { useSeoMeta } from '@unhead/react';
import { SearchBar } from '@/components/SearchBar';
import { LatestArticles } from '@/components/LatestArticles';
import { LatestInHashtag } from '@/components/LatestInHashtag';
import { TrendingTags } from '@/components/TrendingTags';
import { Music, Leaf, BrainCircuit, Bitcoin, Newspaper } from 'lucide-react';

export default function HomePage() {
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

        {/* Latest in #news */}
        <LatestInHashtag 
          hashtag="news" 
          icon={<Newspaper className="h-6 w-6 text-primary" />}
        />

        {/* Latest in #music */}
        <LatestInHashtag 
          hashtag="music" 
          icon={<Music className="h-6 w-6 text-primary" />}
        />

        {/* Latest in #nature */}
        <LatestInHashtag 
          hashtag="nature" 
          icon={<Leaf className="h-6 w-6 text-primary" />}
        />

        {/* Latest in #ai */}
        <LatestInHashtag 
          hashtag="ai" 
          icon={<BrainCircuit className="h-6 w-6 text-primary" />}
        />

        {/* Latest in #bitcoin */}
        <LatestInHashtag 
          hashtag="bitcoin" 
          icon={<Bitcoin className="h-6 w-6 text-primary" />}
        />
      </div>
    </div>
  );
}
