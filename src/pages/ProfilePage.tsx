import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorBlogPosts } from '@/hooks/useAuthorBlogPosts';
import { useUserBookmarkedArticles } from '@/hooks/useUserBookmarkedArticles';
import { ProfileView } from '@/components/ProfileView';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import NotFound from '@/pages/NotFound';

export default function ProfilePage() {
  const { nip19: npub } = useParams<{ nip19: string }>();

  // Decode npub/nprofile to get pubkey
  let pubkey = '';
  let isValidProfile = false;
  
  try {
    if (npub?.startsWith('npub1')) {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        pubkey = decoded.data;
        isValidProfile = true;
      }
    } else if (npub?.startsWith('nprofile1')) {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'nprofile') {
        pubkey = decoded.data.pubkey;
        isValidProfile = true;
      }
    }
  } catch (error) {
    console.error('Failed to decode npub:', error);
  }

  const author = useAuthor(pubkey);
  const { data: posts, isLoading: postsLoading } = useAuthorBlogPosts(pubkey);
  const { data: bookmarkedArticles, isLoading: bookmarksLoading } = useUserBookmarkedArticles(pubkey);

  // If not a valid profile identifier, show 404
  if (!isValidProfile || !pubkey) {
    return <NotFound />;
  }

  // Loading state
  if (author.isLoading) {
    return <ProfileSkeleton />;
  }

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
