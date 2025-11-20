import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Hash } from 'lucide-react';
import { useLongFormContentNotes } from '@/hooks/useLongFormContentNotes';

interface TagCount {
  tag: string;
  count: number;
}

export function TrendingTags() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useLongFormContentNotes();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No posts found
  if (!posts || posts.length === 0) {
    return null;
  }

  // Calculate trending tags
  const tagCounts = new Map<string, number>();
  
  posts.forEach((post) => {
    const tags = post.tags
      .filter(([name]) => name === 't')
      .map(([, value]) => value.toLowerCase());
    
    tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // Sort tags by count and get top tags
  const trendingTags: TagCount[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  if (trendingTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Trending Tags
          </h2>
          <p className="text-sm text-muted-foreground">
            Popular topics across all articles
          </p>
        </div>
      </div>

      {/* Tags Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {trendingTags.map(({ tag, count }) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-sm py-2 px-3 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate(`/tag/${encodeURIComponent(tag)}`)}
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
                <span className="ml-1.5 text-xs opacity-70">
                  {count}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
