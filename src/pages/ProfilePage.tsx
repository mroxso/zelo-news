import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useSeoMeta } from '@unhead/react';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorBlogPosts } from '@/hooks/useAuthorBlogPosts';
import { useUserBookmarkedArticles } from '@/hooks/useUserBookmarkedArticles';
import { ProfileView } from '@/components/ProfileView';
import { ProfileSkeleton } from '@/components/ProfileSkeleton';
import NotFound from '@/pages/NotFound';
import { genUserName } from '@/lib/genUserName';

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

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const about = metadata?.about;
  const picture = metadata?.picture;
  const banner = metadata?.banner;
  const nip05 = metadata?.nip05;

  // Set SEO meta tags when author data is available
  const siteUrl = window.location.origin;
  const profileUrl = window.location.href;
  
  // Create a description from about or default
  const description = about 
    ? (about.length > 160 ? about.substring(0, 157) + '...' : about)
    : `View ${displayName}'s profile and articles on zelo.news`;

  const articleCount = posts?.length || 0;
  const enrichedDescription = author.data && articleCount > 0 
    ? `${description} • ${articleCount} article${articleCount !== 1 ? 's' : ''} published`
    : description;

  useSeoMeta({
    title: author.data && isValidProfile ? `${displayName} - Profile - zelo.news` : 'Profile - zelo.news',
    description: enrichedDescription,
    author: displayName,
    // Open Graph tags for social sharing
    ogTitle: `${displayName} on zelo.news`,
    ogDescription: enrichedDescription,
    ogType: 'profile',
    ogUrl: profileUrl,
    ogImage: banner || picture || `${siteUrl}/icon-512.png`,
    ogSiteName: 'zelo.news',
    // Profile-specific OG tags
    ...(author.data && isValidProfile && {
      profileUsername: nip05 || displayName,
    }),
    // Twitter Card tags
    twitterCard: picture ? 'summary_large_image' : 'summary',
    twitterTitle: `${displayName} on zelo.news`,
    twitterDescription: enrichedDescription,
    twitterImage: banner || picture || `${siteUrl}/icon-512.png`,
    twitterSite: '@zelo_news',
  });

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
