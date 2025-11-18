import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuthor } from '@/hooks/useAuthor';
import { useReactions, useReact } from '@/hooks/useReactions';
import { MarkdownContent } from '@/components/MarkdownContent';
import { CommentsSection } from '@/components/comments/CommentsSection';
import { ZapButton } from '@/components/ZapButton';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ReadingTime } from '@/components/ReadingTime';
import { ArticleProgressBar } from '@/components/ArticleProgressBar';
import { ClientTag } from '@/components/ClientTag';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Calendar, Heart, Edit, ArrowLeft, Share2, Check, Code } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { calculateReadingTime } from '@/lib/calculateReadingTime';
import { isValidDate, toISOStringSafe } from '@/lib/date';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ArticleViewProps {
  post: NostrEvent;
}

export function ArticleView({ post }: ArticleViewProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const author = useAuthor(post.pubkey);
  const { data: reactions } = useReactions(post.id, post.pubkey);
  const { mutate: react } = useReact();

  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(post.pubkey);

  const isPostAuthor = user?.pubkey === post.pubkey;
  const hasReacted = reactions?.likes.some(like => like.pubkey === user?.pubkey);

  const title = post.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = post.tags.find(([name]) => name === 'summary')?.[1];
  const image = post.tags.find(([name]) => name === 'image')?.[1];
  const publishedAt = post.tags.find(([name]) => name === 'published_at')?.[1];
  const identifier = post.tags.find(([name]) => name === 'd')?.[1] || '';
  const hashtags = post.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value);

  const date = publishedAt
    ? new Date(parseInt(publishedAt) * 1000)
    : new Date(post.created_at * 1000);

  const readingTime = calculateReadingTime(post.content);

  const handleReact = () => {
    if (!user) return;
    if (hasReacted) return;
    react({ eventId: post.id, eventAuthor: post.pubkey });
  };

  const handleShare = async () => {
    try {
      const articleUrl = window.location.href;
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyJson = async () => {
    try {
      const jsonString = JSON.stringify(post, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setJsonCopied(true);
      toast({
        title: "JSON copied!",
        description: "Raw event data copied to clipboard",
      });
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy JSON to clipboard",
        variant: "destructive",
      });
    }
  };

  const validDate = isValidDate(date);

  return (
    <div className="min-h-screen">
      <ArticleProgressBar />
      
      <article className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <header className="space-y-6 mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            {title}
          </h1>

          {summary && (
            <p className="text-lg sm:text-xl text-muted-foreground">
              {summary}
            </p>
          )}

          <ReadingTime minutes={readingTime} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link to={`/${nip19.npubEncode(post.pubkey)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage src={metadata?.picture} alt={displayName} />
                <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{displayName}</div>
                {validDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={toISOStringSafe(date)}>
                      {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                )}
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
                <Link
                  key={tag}
                  to={`/search?q=%23${encodeURIComponent(tag)}`}
                  className="hover:opacity-80"
                >
                  <Badge variant="secondary">#{tag}</Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        <div className="mb-12">
          <MarkdownContent content={post.content} />
        </div>

        <Separator className="my-8" />

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

          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {/* <span className="text-xs">Share</span> */}
          </Button>

          <BookmarkButton
            articleCoordinate={`${post.kind}:${post.pubkey}:${identifier}`}
            variant="outline"
            size="default"
            showText={false}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
              >
                <Code className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Raw Event Data</DialogTitle>
                <DialogDescription>
                  NIP-23 blog post event (kind {post.kind})
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                <pre className="text-xs font-mono">
                  {JSON.stringify(post, null, 2)}
                </pre>
              </ScrollArea>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleCopyJson}
                  className="gap-2"
                >
                  {jsonCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4" />
                      Copy JSON
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Separator className="my-8" />

        <div className="mb-8">
          <ClientTag event={post} />
        </div>

        <CommentsSection root={post} />
      </article>
    </div>
  );
}
