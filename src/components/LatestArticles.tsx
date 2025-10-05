import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Newspaper } from 'lucide-react';

interface LatestArticlesProps {
  posts: NostrEvent[];
}

export function LatestArticles({ posts }: LatestArticlesProps) {
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
        {posts.map((post) => {
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
