import { ArticlePreview } from '@/components/ArticlePreview';
import { RelaySelector } from '@/components/RelaySelector';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBookmarkedArticles } from '@/hooks/useBookmarkedArticles';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark } from 'lucide-react';

export function BookmarksPage() {
  const { user } = useCurrentUser();
  const { data: bookmarks = [], isLoading: isLoadingBookmarks } = useBookmarks();
  const { data: articles = [], isLoading: isLoadingArticles } = useBookmarkedArticles();

  const isLoading = isLoadingBookmarks || isLoadingArticles;

  return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Bookmarks</h1>
          </div>
          <p className="text-muted-foreground">
            Articles you've saved for later reading
          </p>
        </div>

        {/* Show login prompt if not logged in */}
        {!user ? (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <Bookmark className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Login to View Bookmarks</h2>
                  <p className="text-muted-foreground">
                    Sign in to see your saved articles
                  </p>
                </div>
                <LoginArea className="flex justify-center" />
              </div>
            </CardContent>
          </Card>
        ) : isLoading ? (
          /* Loading state */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex items-center space-x-2 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty state */
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <Bookmark className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">No Bookmarks Yet</h2>
                  <p className="text-muted-foreground">
                    Start bookmarking articles to see them here. Look for the bookmark button on articles you'd like to save.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : articles.length === 0 ? (
          /* No articles found from bookmarks */
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <p className="text-muted-foreground">
                  Couldn't load bookmarked articles. Try switching to a different relay?
                </p>
                <RelaySelector className="w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Articles grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticlePreview
                key={article.id}
                post={article}
              />
            ))}
          </div>
        )}
      </div>
  );
}
