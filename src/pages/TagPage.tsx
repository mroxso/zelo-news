import { useParams, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useBlogPostsByHashtag } from '@/hooks/useBlogPostsByHashtag';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticlePreview } from '@/components/ArticlePreview';

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const hashtag = tag || '';
  
  const { data: posts, isLoading } = useBlogPostsByHashtag(hashtag, 50);

  // Set SEO meta tags
  const resultCount = posts?.length || 0;
  const title = `#${hashtag} - Articles - zelo.news`;
  const description = `Browse ${resultCount} article${resultCount !== 1 ? 's' : ''} tagged with #${hashtag} on zelo.news`;

  useSeoMeta({
    title,
    description,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 border-b pb-4">
              <Hash className="h-8 w-8 text-primary" />
              <div>
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          {/* Loading skeletons */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with back button */}
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          {/* Tag heading */}
          <div className="flex items-center gap-3 border-b pb-4">
            <Hash className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                #{hashtag}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {posts?.length || 0} {posts?.length === 1 ? 'article' : 'articles'} in this tag
              </p>
            </div>
          </div>
        </div>

        {/* No results */}
        {!isLoading && (!posts || posts.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <p className="text-muted-foreground">
                  No articles found with tag #{hashtag}. Check your relay connections or wait for content to load.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Grid */}
        {posts && posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticlePreview key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
