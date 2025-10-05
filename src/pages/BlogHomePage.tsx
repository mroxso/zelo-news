import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { RelaySelector } from '@/components/RelaySelector';

export default function BlogHomePage() {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8 space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Posts skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8">
          {/* Empty state */}
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <p className="text-muted-foreground">
                  No blog posts found. Try another relay?
                </p>
                <RelaySelector className="w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Posts grid */}
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
                    <h2 className="text-xl sm:text-2xl font-bold line-clamp-2 mb-2">
                      {title}
                    </h2>
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
    </div>
  );
}
