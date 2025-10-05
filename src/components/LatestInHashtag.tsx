import { Link, useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Hash, ChevronRight } from 'lucide-react';
import { useBlogPostsByHashtag } from '@/hooks/useBlogPostsByHashtag';

interface LatestInHashtagProps {
  hashtag: string;
  icon?: React.ReactNode;
}

const INITIAL_POSTS_COUNT = 3;

export function LatestInHashtag({ hashtag, icon }: LatestInHashtagProps) {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useBlogPostsByHashtag(hashtag);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {icon || <Hash className="h-6 w-6 text-primary" />}
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-40 w-full" />
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
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
  
  const visiblePosts = posts.slice(0, INITIAL_POSTS_COUNT);
  const hasMore = posts.length > INITIAL_POSTS_COUNT;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon || <Hash className="h-6 w-6 text-primary" />}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Latest in #{hashtag}
            </h2>
            <p className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'article' : 'articles'}
            </p>
          </div>
        </div>
        {hasMore && (
          <Button
            onClick={() => navigate(`/search?q=${encodeURIComponent('#' + hashtag)}`)}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => {
          const title = post.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
          const summary = post.tags.find(([name]) => name === 'summary')?.[1];
          const image = post.tags.find(([name]) => name === 'image')?.[1];
          const publishedAt = post.tags.find(([name]) => name === 'published_at')?.[1];
          const identifier = post.tags.find(([name]) => name === 'd')?.[1] || '';
          const hashtags = post.tags
            .filter(([name]) => name === 't')
            .map(([, value]) => value)
            .slice(0, 3);

          const date = publishedAt
            ? new Date(parseInt(publishedAt) * 1000)
            : new Date(post.created_at * 1000);

          const naddr = nip19.naddrEncode({
            kind: 30023,
            pubkey: post.pubkey,
            identifier,
          });

          return (
            <Link key={post.id} to={`/${naddr}`}>
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
                  <h3 className="text-lg font-bold line-clamp-2 mb-2">
                    {title}
                  </h3>
                  {summary && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {summary}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={date.toISOString()}>
                      {date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {hashtags.map((tag) => (
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
        })}
      </div>

    </div>
  );
}
