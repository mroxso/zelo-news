import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useNostr } from '@nostrify/react';
import { useAuthor } from '@/hooks/useAuthor';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Hash } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import type { NostrEvent } from '@nostrify/nostrify';
import NotFound from './NotFound';

interface EventPageProps {
  eventId: string;
  relayHints?: string[];
  authorPubkey?: string;
  kind?: number;
}

export function EventPage({ eventId, relayHints, authorPubkey, kind }: EventPageProps) {
  const { nostr } = useNostr();

  // Fetch the event
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId, authorPubkey, kind],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      // Build filter based on available data
      const filter: {
        ids: string[];
        limit: number;
        authors?: string[];
        kinds?: number[];
      } = { ids: [eventId], limit: 1 };
      if (authorPubkey) filter.authors = [authorPubkey];
      if (kind !== undefined) filter.kinds = [kind];

      // Use relay hints if provided, otherwise use default pool
      const relay = relayHints && relayHints.length > 0 
        ? nostr.group(relayHints) 
        : nostr;

      const events = await relay.query([filter], { signal });
      return events[0] as NostrEvent | undefined;
    },
  });

  const author = useAuthor(event?.pubkey || '');
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(event?.pubkey || '');
  const profileImage = metadata?.picture;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-3xl py-8 px-4">
          <Skeleton className="h-8 w-24 mb-6" />
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  const date = new Date(event.created_at * 1000);

  return (
    <div className="min-h-screen">
      <div className="container max-w-3xl py-8 px-4">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Event card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Kind {event.kind}
              </Badge>
              <time 
                dateTime={date.toISOString()}
                className="text-sm text-muted-foreground flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>

            <Link 
              to={`/${nip19.npubEncode(event.pubkey)}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{displayName}</div>
                <div className="text-sm text-muted-foreground">
                  {event.pubkey.slice(0, 8)}...{event.pubkey.slice(-8)}
                </div>
              </div>
            </Link>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Event content */}
            {event.content && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Content</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap break-words text-sm font-mono">
                    {event.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Event tags */}
            {event.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tags</h3>
                <div className="space-y-1">
                  {event.tags.map((tag, index) => (
                    <div 
                      key={index}
                      className="bg-muted p-2 rounded text-xs font-mono flex gap-2"
                    >
                      {tag.map((value, i) => (
                        <span key={i} className={i === 0 ? 'font-semibold' : ''}>
                          {value}
                          {i < tag.length - 1 && <span className="text-muted-foreground ml-2">,</span>}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event metadata */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Metadata</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm font-mono">
                <div>
                  <span className="text-muted-foreground">ID:</span>{' '}
                  <span className="break-all">{event.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pubkey:</span>{' '}
                  <span className="break-all">{event.pubkey}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signature:</span>{' '}
                  <span className="break-all">{event.sig}</span>
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <details>
              <summary className="text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground">
                View Raw JSON
              </summary>
              <div className="mt-2 bg-muted p-4 rounded-lg">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(event, null, 2)}
                </pre>
              </div>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
