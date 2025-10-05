import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
import { SearchBar } from '@/components/SearchBar';
import { LatestArticles } from '@/components/LatestArticles';

export default function BlogHomePage() {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>

          {/* Posts skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>

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
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>

        {/* Latest Articles */}
        <LatestArticles posts={posts} />
      </div>
    </div>
  );
}
