import { useState } from 'react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Newspaper, ChevronDown } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';

const INITIAL_POSTS_COUNT = 3;
const LOAD_MORE_COUNT = 6;

function ArticleCard({ post }: { post: NostrEvent }) {
  const { data: author } = useAuthor(post.pubkey);
  const metadata = author?.metadata;

  const title = post.tags.find(([name]: [string]) => name === 'title')?.[1] || 'Untitled';
  const summary = post.tags.find(([name]: [string]) => name === 'summary')?.[1];
  const image = post.tags.find(([name]: [string]) => name === 'image')?.[1];
  const publishedAt = post.tags.find(([name]: [string]) => name === 'published_at')?.[1];
  const identifier = post.tags.find(([name]: [string]) => name === 'd')?.[1] || '';
  const hashtags = post.tags
    .filter(([name]: [string]) => name === 't')
    .map(([, value]: [string, string]) => value)
    .slice(0, 3);

  const date = publishedAt
    ? new Date(parseInt(publishedAt) * 1000)
    : new Date(post.created_at * 1000);

  const naddr = nip19.naddrEncode({
    kind: 30023,
    pubkey: post.pubkey,
    identifier,
  });

  const displayName = metadata?.name || metadata?.display_name || genUserName(post.pubkey);
  const avatarUrl = metadata?.picture;

  return (
    <Link to={`/${naddr}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {image && (
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold line-clamp-2 mb-2">
            {title}
          </h3>
          {summary && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {summary}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3" />
            <time dateTime={date.toISOString()}>
              {date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{displayName}</span>
          </div>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function LatestArticles() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_POSTS_COUNT);
  const { data: posts, isLoading } = useBlogPosts();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No posts found
  if (!posts || posts.length === 0) {
    return null;
  }
  
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, posts.length));
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Newspaper className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover the most recent stories from the community
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Load More Articles
            <span className="text-muted-foreground ml-1">
              ({posts.length - visibleCount} remaining)
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
