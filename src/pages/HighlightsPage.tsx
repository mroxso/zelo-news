import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserHighlights } from '@/hooks/useUserHighlights';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginArea } from '@/components/auth/LoginArea';
import { Highlighter, ExternalLink, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { getHighlightSource, getHighlightComment, isQuoteHighlight } from '@/lib/validators';
import { useAuthor } from '@/hooks/useAuthor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { genUserName } from '@/lib/genUserName';

function HighlightCard({ highlight }: { highlight: { id: string; pubkey: string; content: string; created_at: number; tags: string[][] } }) {
  const source = getHighlightSource(highlight as never);
  const comment = getHighlightComment(highlight as never);
  const isQuote = isQuoteHighlight(highlight as never);
  const { data: author } = useAuthor(highlight.pubkey);
  const metadata = author?.metadata;

  const displayName = metadata?.name || metadata?.display_name || genUserName(highlight.pubkey);
  const avatarUrl = metadata?.picture;

  // Parse source to get article link
  let articleLink: string | null = null;
  if (source?.type === 'address') {
    // Parse a-tag: "30023:pubkey:d-tag"
    const parts = source.value.split(':');
    if (parts.length === 3) {
      const [kind, pubkey, identifier] = parts;
      const naddr = nip19.naddrEncode({
        kind: parseInt(kind),
        pubkey: pubkey,
        identifier: identifier,
      });
      articleLink = `/${naddr}`;
    }
  } else if (source?.type === 'url') {
    articleLink = source.value;
  }

  const date = new Date(highlight.created_at * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                to={`/${nip19.npubEncode(highlight.pubkey)}`}
                className="font-medium text-sm hover:underline truncate block"
              >
                {displayName}
              </Link>
              <time className="text-xs text-muted-foreground">
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
          </div>
          {isQuote && (
            <Badge variant="secondary" className="flex-shrink-0">
              <MessageSquare className="h-3 w-3 mr-1" />
              Quote
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Highlighted text */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-3 rounded-r">
          <p className="text-sm italic">&ldquo;{highlight.content}&rdquo;</p>
        </div>

        {/* Comment if it's a quote highlight */}
        {comment && (
          <div className="pl-4 border-l-2 border-muted">
            <p className="text-sm text-muted-foreground">{comment}</p>
          </div>
        )}

        {/* Link to source */}
        {articleLink && (
          <div className="pt-2">
            {source?.type === 'address' ? (
              <Link
                to={articleLink}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View article
              </Link>
            ) : (
              <a
                href={articleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View source
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HighlightsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HighlightsPage() {
  const { user } = useCurrentUser();
  const { data: highlights, isLoading } = useUserHighlights(user?.pubkey || '', {
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Highlighter className="h-12 w-12 mx-auto text-muted-foreground" />
              <h1 className="text-3xl font-bold">Your Highlights</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Sign in to view and manage your saved highlights from articles across Nostr
              </p>
            </div>
            <LoginArea className="flex justify-center" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Highlighter className="h-8 w-8" />
              My Highlights
            </h1>
            <p className="text-muted-foreground">
              Your collection of valuable insights and passages from articles
            </p>
          </div>

          {/* Loading state */}
          {isLoading && <HighlightsSkeleton />}

          {/* Highlights list */}
          {!isLoading && highlights && highlights.length > 0 && (
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <HighlightCard key={highlight.id} highlight={highlight} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!highlights || highlights.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <Highlighter className="h-12 w-12 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No highlights yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Start highlighting valuable passages from articles to build your collection of insights.
                    Select any text in an article and click &ldquo;Highlight&rdquo; to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
