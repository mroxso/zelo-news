import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, ChevronRight } from 'lucide-react';
import { useBlogPostsByHashtag } from '@/hooks/useBlogPostsByHashtag';
import { ArticlePreview } from '@/components/ArticlePreview';

interface LatestInHashtagProps {
  hashtag: string;
  icon?: React.ReactNode;
  title?: string;
}

const INITIAL_POSTS_COUNT = 3;

export function LatestInHashtag({ hashtag, icon, title }: LatestInHashtagProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useBlogPostsByHashtag(hashtag, 4);

  // Remove duplicate events by ID
  const posts = useMemo(() => {
    const seen = new Set();
    return data?.pages.flat().filter(event => {
      if (!event.id || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    }) || [];
  }, [data?.pages]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          {icon || <Hash className="h-8 w-8 text-primary" />}
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
  
  const visiblePosts = posts.slice(0, INITIAL_POSTS_COUNT);
  const hasMore = posts.length > INITIAL_POSTS_COUNT;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        {icon || <Hash className="h-8 w-8 text-primary" />}
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {title || `Latest in #${hashtag}`}
          </h2>
          {/* <p className="text-sm text-muted-foreground mt-1">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
          </p> */}
        </div>
        {hasMore && (
          <Button
            onClick={() => navigate(`/tag/${encodeURIComponent(hashtag)}`)}
            variant="outline"
            size="default"
            className="gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => (
          <ArticlePreview key={post.id} post={post} />
        ))}
      </div>

    </div>
  );
}
