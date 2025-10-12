import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useSeoMeta } from '@unhead/react';
import { useBlogPost } from '@/hooks/useBlogPost';
import { useAuthor } from '@/hooks/useAuthor';
import { ArticleView } from '@/components/ArticleView';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/NotFound';
import { genUserName } from '@/lib/genUserName';
import { useEffect } from 'react';

export default function ArticlePage() {
  const { nip19: naddr } = useParams<{ nip19: string }>();

  let pubkey = '';
  let identifier = '';
  let kind = 0;
  let isValidNaddr = false;

  try {
    if (naddr?.startsWith('naddr1')) {
      const decoded = nip19.decode(naddr);
      if (decoded.type === 'naddr') {
        pubkey = decoded.data.pubkey;
        identifier = decoded.data.identifier;
        kind = decoded.data.kind;
        isValidNaddr = true;
      }
    }
  } catch (error) {
    console.error('Failed to decode naddr:', error);
  }

  const { data: post, isLoading } = useBlogPost(pubkey, identifier);
  const author = useAuthor(pubkey);

  // Extract article metadata
  const title = post?.tags.find(([name]) => name === 'title')?.[1] || 'Article';
  const summary = post?.tags.find(([name]) => name === 'summary')?.[1];
  const image = post?.tags.find(([name]) => name === 'image')?.[1];
  const publishedAt = post?.tags.find(([name]) => name === 'published_at')?.[1];
  const hashtags = post?.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value) || [];

  const metadata = author.data?.metadata;
  const authorName = metadata?.display_name || metadata?.name || genUserName(pubkey);

  const date = publishedAt
    ? new Date(parseInt(publishedAt) * 1000)
    : post ? new Date(post.created_at * 1000) : new Date();

  // Set SEO meta tags when post data is available
  useEffect(() => {
    if (post && isValidNaddr) {
      const siteUrl = window.location.origin;
      const articleUrl = window.location.href;
      
      // Create a description from summary or content
      const description = summary || 
        (post.content.length > 160 
          ? post.content.substring(0, 157) + '...' 
          : post.content);

      useSeoMeta({
        title: `${title} - ${authorName} - zelo.news`,
        description,
        author: authorName,
        // Open Graph tags for social sharing
        ogTitle: title,
        ogDescription: description,
        ogType: 'article',
        ogUrl: articleUrl,
        ogImage: image || `${siteUrl}/icon-512.png`,
        ogSiteName: 'zelo.news',
        // Article-specific OG tags
        articlePublishedTime: date.toISOString(),
        articleAuthor: [authorName],
        ...(hashtags.length > 0 && { articleTag: hashtags }),
        // Twitter Card tags
        twitterCard: 'summary_large_image',
        twitterTitle: title,
        twitterDescription: description,
        twitterImage: image || `${siteUrl}/icon-512.png`,
        twitterSite: '@zelo_news',
      });
    }
  }, [post, isValidNaddr, title, summary, image, authorName, hashtags, date]);

  if (!isValidNaddr || !naddr || kind !== 30023) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  return <ArticleView post={post} />;
}
