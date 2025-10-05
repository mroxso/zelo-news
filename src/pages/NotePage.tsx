import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useNostr } from '@nostrify/react';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReactions, useReact } from '@/hooks/useReactions';
import { NoteContent } from '@/components/NoteContent';
import { ZapButton } from '@/components/ZapButton';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import type { NostrEvent } from '@nostrify/nostrify';
import NotFound from './NotFound';

interface NotePageProps {
  eventId: string;
}

export function NotePage({ eventId }: NotePageProps) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  // Fetch the note event
  const { data: note, isLoading } = useQuery({
    queryKey: ['note', eventId],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query(
        [{ ids: [eventId], kinds: [1], limit: 1 }],
        { signal }
      );
      return events[0] as NostrEvent | undefined;
    },
  });

  const author = useAuthor(note?.pubkey || '');
  const { data: reactions } = useReactions(eventId, note?.pubkey || '');
  const { mutate: react } = useReact();

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(note?.pubkey || '');
  const profileImage = metadata?.picture;

  const hasReacted = reactions?.likes.some(like => like.pubkey === user?.pubkey);

  const handleReact = () => {
    if (!user || !note) return;
    if (hasReacted) return;
    react({ eventId: note.id, eventAuthor: note.pubkey });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-2xl py-8 px-4">
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

  if (!note) {
    return <NotFound />;
  }

  const date = new Date(note.created_at * 1000);

  return (
    <div className="min-h-screen">
      <div className="container max-w-2xl py-8 px-4">
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

        {/* Note card */}
        <Card>
          <CardHeader>
            <Link 
              to={`/${nip19.npubEncode(note.pubkey)}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{displayName}</div>
                <time 
                  dateTime={date.toISOString()}
                  className="text-sm text-muted-foreground"
                >
                  {date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Note content */}
            <div className="whitespace-pre-wrap break-words">
              <NoteContent event={note} className="text-base" />
            </div>

            <Separator />

            {/* Interaction buttons */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReact}
                disabled={!user || hasReacted}
                className={hasReacted ? 'text-red-500' : ''}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 ${hasReacted ? 'fill-current' : ''}`} 
                />
                {reactions?.likes.length || 0}
              </Button>

              <Button variant="ghost" size="sm" disabled>
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments
              </Button>

              {note && (
                <ZapButton
                  target={note}
                  showCount={true}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments section */}
        <div className="mt-8">
          <CommentsSection root={note} />
        </div>
      </div>
    </div>
  );
}
