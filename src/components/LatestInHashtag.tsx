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
        {visiblePosts.map((post) => (
          <ArticlePreview key={post.id} post={post} variant="compact" />
        ))}
      </div>

    </div>
  );
}
