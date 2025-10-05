import { SearchBar } from '@/components/SearchBar';
import { LatestArticles } from '@/components/LatestArticles';
import { LatestInHashtag } from '@/components/LatestInHashtag';
import { TrendingTags } from '@/components/TrendingTags';
import { Music, Leaf, BrainCircuit, Bitcoin } from 'lucide-react';

export default function BlogHomePage() {

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
