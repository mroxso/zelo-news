import { useParams } from 'react-router-dom';
import { useBlogPostByDTag } from '@/hooks/useBlogPostByDTag';
import { ArticleView } from '@/components/ArticleView';
import { Skeleton } from '@/components/ui/skeleton';
import NotFound from '@/pages/NotFound';

export default function ArticleByDTagPage() {
  const { dtag } = useParams<{ dtag: string }>();

  const { data: post, isLoading } = useBlogPostByDTag(dtag || '');

  if (!dtag) {
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
