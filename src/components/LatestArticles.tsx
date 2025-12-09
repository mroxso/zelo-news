import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Newspaper } from 'lucide-react';
import { useLongFormContentNotes } from '@/hooks/useLongFormContentNotes';
import { ArticlePreview } from '@/components/ArticlePreview';

const INITIAL_POSTS_COUNT = 4;
// const LOAD_MORE_COUNT = 6;

export function LatestArticles() {
  const [visibleCount] = useState(INITIAL_POSTS_COUNT);
  const { data: posts, isLoading } = useLongFormContentNotes();
  
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
  // const hasMore = visibleCount < posts.length;
  const featuredPost = visiblePosts[0];
  const gridPosts = visiblePosts.slice(1, 4);

  // const handleLoadMore = () => {
  //   setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, posts.length));
  // };

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

      {/* Featured Post - Full Width */}
      {featuredPost && (
        <div className="w-full">
          <ArticlePreview key={featuredPost.id} post={featuredPost} featured />
        </div>
      )}

      {/* Posts Grid - 3 articles */}
      {gridPosts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gridPosts.map((post) => (
            <ArticlePreview key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {/* {hasMore && (
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
      )} */}
    </div>
  );
}
