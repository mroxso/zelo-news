import { useParams, Link, useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useBlogPost } from '@/hooks/useBlogPost';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReactions, useReact } from '@/hooks/useReactions';
import { MarkdownContent } from '@/components/MarkdownContent';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { ZapButton } from '@/components/ZapButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Heart, Edit, ArrowLeft } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import NotFound from '@/pages/NotFound';

export default function BlogPostPage() {
  const { nip19: naddr } = useParams<{ nip19: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  // Decode naddr
  let pubkey = '';
  let identifier = '';
  let kind = 0;
  let isValidNaddr = false;

  try {
    if (naddr?.startsWith('naddr1')) {
      const decoded = nip19.decode(naddr);
      if (decoded.type === 'naddr') {
        pubkey = decoded.data.pubkey;
        identifier = decoded.data.identifier;
        kind = decoded.data.kind;
        isValidNaddr = true;
      }
    }
  } catch (error) {
    console.error('Failed to decode naddr:', error);
  }

  const { data: post, isLoading } = useBlogPost(pubkey, identifier);
  const author = useAuthor(pubkey);
  const { data: reactions } = useReactions(post?.id || '', pubkey);
  const { mutate: react } = useReact();

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);

  // Check if the current user is the author of this post
  const isPostAuthor = user?.pubkey === post?.pubkey;
  const hasReacted = reactions?.likes.some(like => like.pubkey === user?.pubkey);

  if (!isValidNaddr || !naddr || kind !== 30023) {
    return <NotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64 w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  const title = post.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = post.tags.find(([name]) => name === 'summary')?.[1];
  const image = post.tags.find(([name]) => name === 'image')?.[1];
  const publishedAt = post.tags.find(([name]) => name === 'published_at')?.[1];
  const hashtags = post.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value);

  const date = publishedAt
    ? new Date(parseInt(publishedAt) * 1000)
    : new Date(post.created_at * 1000);

  const handleReact = () => {
    if (!user) return;
    if (hasReacted) return;
    react({ eventId: post.id, eventAuthor: post.pubkey });
  };

  return (
    <div className="min-h-screen">
      <article className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Button>

        {/* Post header */}
        <header className="space-y-6 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {title}
          </h1>

          {summary && (
            <p className="text-lg sm:text-xl text-muted-foreground">
              {summary}
            </p>
          )}

          {/* Author info and metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link to={`/${nip19.npubEncode(pubkey)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={metadata?.picture} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{displayName}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={date.toISOString()}>
                    {date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              </div>
            </Link>

            {isPostAuthor && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link to={`/edit/${identifier}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Cover image */}
        {image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Post content */}
        <div className="mb-12">
          <MarkdownContent content={post.content} />
        </div>

        <Separator className="my-8" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <Button
            variant={hasReacted ? "default" : "outline"}
            onClick={handleReact}
            disabled={!user || hasReacted}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${hasReacted ? 'fill-current' : ''}`} />
            <span className="text-xs">
              {reactions?.likeCount || 0}
            </span>
          </Button>

          <ZapButton
            target={post}
            showCount={true}
          />
        </div>

        <Separator className="my-8" />

        {/* Comments section */}
        <CommentsSection
          root={post}
        />
      </article>
    </div>
  );
}
