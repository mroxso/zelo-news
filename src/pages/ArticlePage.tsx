import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useBlogPost } from '@/hooks/useBlogPost';
import { ArticleView } from '@/components/ArticleView';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/NotFound';

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
