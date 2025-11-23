import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, ChevronRight } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { ArticlePreview } from '@/components/ArticlePreview';
import { deduplicateEvents } from '@/lib/deduplicateEvents';

interface LatestInHashtagProps {
  hashtags: string | string[];
  icon?: React.ReactNode;
  title?: string;
}

interface BlogPost extends NostrEvent {
  kind: 30023;
}

/**
 * Validates that a Nostr event is a valid NIP-23 blog post
 */
function validateBlogPost(event: NostrEvent): event is BlogPost {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  if (!d || !title) return false;

  return true;
}

const INITIAL_POSTS_COUNT = 3;

export function LatestInHashtag({ hashtags, icon, title }: LatestInHashtagProps) {
  const navigate = useNavigate();
  const { nostr } = useNostr();
  
  // Normalize hashtags to always be an array
  const hashtagArray = useMemo(() => {
    return Array.isArray(hashtags) ? hashtags : [hashtags];
  }, [hashtags]);

  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['blog-posts-hashtags', hashtagArray, 4],
    queryFn: async ({ pageParam, signal }) => {
      const filter: {
        kinds: number[];
        '#t': string[];
        limit: number;
        until?: number;
      } = { 
        kinds: [30023], 
        '#t': hashtagArray.map(h => h.toLowerCase()),
        limit: 4
      };
      
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) });
      
      return events.filter(validateBlogPost);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;
      const oldestEvent = lastPage[lastPage.length - 1];
      return oldestEvent.created_at;
    },
    initialPageParam: undefined as number | undefined,
  });

  // Remove duplicate events by ID
  const posts = useMemo(() => {
    return deduplicateEvents(data?.pages.flat() || []);
  }, [data?.pages]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          {icon || <Hash className="h-8 w-8 text-primary" />}
          <div>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
    );
  }

  // No posts found
  if (!posts || posts.length === 0) {
    return null;
  }
  
  const visiblePosts = posts.slice(0, INITIAL_POSTS_COUNT);
  const hasMore = posts.length > INITIAL_POSTS_COUNT;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        {icon || <Hash className="h-8 w-8 text-primary" />}
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {title || (hashtagArray.length === 1 
              ? `Latest in #${hashtagArray[0]}`
              : `Latest in ${hashtagArray.map(h => `#${h}`).join(', ')}`
            )}
          </h2>
          {/* <p className="text-sm text-muted-foreground mt-1">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
          </p> */}
        </div>
        {hasMore && hashtagArray.length === 1 && (
          <Button
            onClick={() => navigate(`/tag/${encodeURIComponent(hashtagArray[0])}`)}
            variant="outline"
            size="default"
            className="gap-1"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post) => (
          <ArticlePreview key={post.id} post={post} />
        ))}
      </div>

    </div>
  );
}
