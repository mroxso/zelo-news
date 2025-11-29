import { useAllHighlights } from '@/hooks/useHighlights';
import { Highlight } from '@/components/highlights/Highlight';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Highlighter } from 'lucide-react';
import { RelayListManager } from '@/components/RelayListManager';

export default function HighlightsPage() {
  const { data: highlights, isLoading } = useAllHighlights(100);

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Highlighter className="h-8 w-8" />
              Highlights
            </h1>
            <p className="text-muted-foreground">
              Discover valuable content highlighted by the community
            </p>
          </div>

          {/* Highlights List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
            </div>
          ) : highlights && highlights.length > 0 ? (
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <Highlight key={highlight.id} highlight={highlight} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <Highlighter className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Highlights Yet</h3>
                    <p className="text-muted-foreground">
                      Highlights will appear here once users start highlighting content.
                    </p>
                  </div>
                  <RelayListManager />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

