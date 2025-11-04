import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthor } from '@/hooks/useAuthor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { genUserName } from '@/lib/genUserName';
import { Calendar } from 'lucide-react';
import { MarkdownContent } from '@/components/MarkdownContent';

interface HighlightProps {
  highlight: NostrEvent;
  showSource?: boolean;
}

// Separate component for p-tag authors to avoid hook usage in map
function PTagAuthor({ pubkey, role }: { pubkey: string; role?: string }) {
  const pAuthor = useAuthor(pubkey);
  const pMetadata = pAuthor.data?.metadata;
  const pDisplayName =
    pMetadata?.display_name ||
    pMetadata?.name ||
    genUserName(pubkey);

  return (
    <Link
      to={`/${nip19.npubEncode(pubkey)}`}
      className="text-xs text-muted-foreground hover:text-foreground"
    >
      {pDisplayName} {role && `(${role})`}
    </Link>
  );
}

export function Highlight({ highlight, showSource = true }: HighlightProps) {
  const author = useAuthor(highlight.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(highlight.pubkey);

  // Extract tags
  const eTag = highlight.tags.find(([name]) => name === 'e')?.[1];
  const aTag = highlight.tags.find(([name]) => name === 'a')?.[1];
  const rTag = highlight.tags.find(([name]) => name === 'r')?.[1];
  const contextTag = highlight.tags.find(([name]) => name === 'context')?.[1];
  const commentTag = highlight.tags.find(([name]) => name === 'comment')?.[1];
  const pTags = highlight.tags.filter(([name]) => name === 'p');

  const date = new Date(highlight.created_at * 1000);

  // Determine source
  let sourceLink: string | null = null;
  let sourceLabel: string | null = null;

  if (eTag) {
    // Use note1 format for event IDs
    try {
      const noteId = nip19.noteEncode(eTag);
      sourceLink = `/${noteId}`;
      sourceLabel = 'Note';
    } catch {
      // Fallback to nevent if noteEncode fails
      try {
        sourceLink = `/${nip19.neventEncode({ id: eTag })}`;
        sourceLabel = 'Event';
      } catch {
        // If both fail, don't show source link
        sourceLink = null;
      }
    }
  } else if (aTag) {
    // Parse a tag: kind:pubkey:identifier
    const [kind, pubkey, identifier] = aTag.split(':');
    try {
      const naddr = nip19.naddrEncode({
        kind: parseInt(kind),
        pubkey,
        identifier,
      });
      sourceLink = `/${naddr}`;
      sourceLabel = 'Article';
    } catch {
      // If encoding fails, just show the a tag
      sourceLink = null;
    }
  } else if (rTag) {
    sourceLink = rTag;
    sourceLabel = 'URL';
  }

  // Check if this is a quote highlight (has comment tag)
  const isQuoteHighlight = !!commentTag;

  return (
    <Card className="border-l-4 border-l-yellow-500/50">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <Link to={`/${nip19.npubEncode(highlight.pubkey)}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={metadata?.picture} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                to={`/${nip19.npubEncode(highlight.pubkey)}`}
                className="font-semibold hover:underline block truncate"
              >
                {displayName}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <time dateTime={date.toISOString()}>
                  {date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>
          </div>

          {/* Context (if available) */}
          {contextTag && (
            <div className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded">
              {contextTag}
            </div>
          )}

          {/* Highlight content */}
          {highlight.content && (
            <div className="bg-yellow-500/10 dark:bg-yellow-500/20 border-l-4 border-yellow-500/50 pl-4 py-2 rounded-r">
              <MarkdownContent content={highlight.content} className="text-sm" />
            </div>
          )}

          {/* Quote highlight (with comment) */}
          {isQuoteHighlight && commentTag && (
            <div className="border-l-4 border-primary/30 pl-4 py-2 bg-muted/30 rounded-r">
              <MarkdownContent content={commentTag} className="text-sm" />
            </div>
          )}

          {/* Source reference */}
          {showSource && sourceLink && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Badge variant="outline" className="text-xs">
                {sourceLabel}
              </Badge>
              {sourceLink.startsWith('http') ? (
                <a
                  href={sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground truncate"
                >
                  {sourceLink}
                </a>
              ) : (
                <Link
                  to={sourceLink}
                  className="text-xs text-muted-foreground hover:text-foreground truncate"
                >
                  View source
                </Link>
              )}
            </div>
          )}

          {/* Author/Editor tags (p tags) */}
          {pTags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {pTags.map((tag, index) => {
                const pubkey = tag[1];
                const role = tag[3] || 'author';
                return (
                  <PTagAuthor
                    key={`${pubkey}-${index}`}
                    pubkey={pubkey}
                    role={role}
                  />
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

