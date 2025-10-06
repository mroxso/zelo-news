import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { getHighlightSource, getHighlightComment, isQuoteHighlight } from '@/lib/validators';
import { useAuthor } from '@/hooks/useAuthor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';

interface HighlightCardProps {
  highlight: {
    id: string;
    pubkey: string;
    content: string;
    created_at: number;
    tags: string[][];
  };
}

/**
 * Card component for displaying a highlight with author, content, and source link
 * Used in HighlightsPage and potentially profile pages
 */
export function HighlightCard({ highlight }: HighlightCardProps) {
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
