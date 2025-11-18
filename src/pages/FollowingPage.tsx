import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFollowingBlogPosts } from '@/hooks/useFollowingBlogPosts';
import { ArticlePreview } from '@/components/ArticlePreview';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RelayListManager } from '@/components/RelayListManager';
import { Users } from 'lucide-react';
import { LoginArea } from '@/components/auth/LoginArea';

export default function FollowingPage() {
  const { user } = useCurrentUser();
  const { data: posts = [], isLoading, isError } = useFollowingBlogPosts();

  useSeoMeta({
    title: 'Following - zelo.news',
    description: 'Read articles from people you follow on zelo.news',
    robots: 'noindex', // Don't index personal following feeds
  });

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <div className="flex justify-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Sign in to see posts from people you follow</h2>
                  <p className="text-muted-foreground text-sm">
                    Log in to view long-form content from the authors you follow on Nostr.
                  </p>
                </div>
                <LoginArea className="max-w-60 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-8 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">Following</h1>
          </div>
          <p className="text-muted-foreground">
            Articles from people you follow
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="aspect-video">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <p className="text-muted-foreground">
                  Failed to load articles. Try another relay?
                </p>
                <RelayListManager />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !isError && posts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    No articles found from people you follow.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try following some authors or switching to a different relay.
                  </p>
                </div>
                <RelayListManager />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts grid */}
        {!isLoading && !isError && posts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <ArticlePreview key={post.id} post={post} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
