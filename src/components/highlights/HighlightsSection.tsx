import type { NostrEvent } from '@nostrify/nostrify';
import { useHighlights } from '@/hooks/useHighlights';
import { Highlight } from './Highlight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return null; // Don't show loading state - just hide the section
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

