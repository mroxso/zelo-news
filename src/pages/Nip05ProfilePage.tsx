import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveNip05 } from '@/lib/resolveNip05';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorBlogPosts } from '@/hooks/useAuthorBlogPosts';
import { useUserBookmarkedArticles } from '@/hooks/useUserBookmarkedArticles';
import { Card, CardContent } from '@/components/ui/card';
import { RelayListManager } from '@/components/RelayListManager';
import { ProfileView } from '@/components/ProfileView';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import NotFound from '@/pages/NotFound';

export default function Nip05ProfilePage() {
  const { nip05 } = useParams<{ nip05: string }>();

  // Decode the URL parameter (handles URL encoding)
  const decodedNip05 = nip05 ? decodeURIComponent(nip05) : '';

  // Validate that it looks like a NIP-05 identifier: non-empty local part, '@', valid domain
  const nip05Regex = /^[^@]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  const isValidFormat = nip05Regex.test(decodedNip05);

  // Resolve the NIP-05 identifier to a pubkey
  const { data: pubkey, isLoading: resolvingNip05, isError } = useQuery({
    queryKey: ['nip05-resolve', decodedNip05],
    queryFn: async () => {
      if (!isValidFormat) {
        return null;
      }
      return await resolveNip05(decodedNip05);
    },
    enabled: isValidFormat,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Fetch author data once we have the pubkey
  const author = useAuthor(pubkey || '');
  const { data: posts, isLoading: postsLoading } = useAuthorBlogPosts(pubkey || '');
  const { data: bookmarkedArticles, isLoading: bookmarksLoading } = useUserBookmarkedArticles(pubkey || '');

  // Show 404 if the format is invalid
  if (!isValidFormat) {
    return <NotFound />;
  }

  // Loading state - resolving NIP-05
  if (resolvingNip05) {
    return <ProfileSkeleton />;
  }

  // Error state - NIP-05 resolution failed or not found
  if (isError || !pubkey) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8">
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <p className="text-muted-foreground">
                  Could not resolve NIP-05 identifier: {decodedNip05}
                </p>
                <p className="text-sm text-muted-foreground">
                  The identifier may not exist, or the server may be temporarily unavailable. Try another relay?
                </p>
                <RelayListManager />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading profile data
  if (author.isLoading) {
    return <ProfileSkeleton />;
  }

  // Render profile
  return (
    <ProfileView
      pubkey={pubkey}
      metadata={author.data?.metadata}
      posts={posts}
      bookmarkedArticles={bookmarkedArticles}
      postsLoading={postsLoading}
      bookmarksLoading={bookmarksLoading}
    />
  );
}
