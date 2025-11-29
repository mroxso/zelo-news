import type { NostrEvent } from '@nostrify/nostrify';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from './Highlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Highlighter } from 'lucide-react';

interface HighlightsSectionProps {
  event: NostrEvent;
  title?: string;
  emptyStateMessage?: string;
  className?: string;
}

export function HighlightsSection({
  event,
  title = 'Highlights',
  className,
}: HighlightsSectionProps) {
  const { data: highlights, isLoading } = useHighlights(event);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Highlighter className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-l-4 border-l-yellow-500/50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!highlights || highlights.length === 0) {
    return null; // Don't show empty state - just hide the section
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Highlighter className="h-5 w-5" />
          {title}
          {highlights.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({highlights.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {highlights.map((highlight) => (
          <Highlight key={highlight.id} highlight={highlight} />
        ))}
      </CardContent>
    </Card>
  );
}

