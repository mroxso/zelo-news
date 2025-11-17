import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { isValidDate, toISOStringSafe } from '@/lib/date';

interface ArticlePreviewProps {
  post: NostrEvent;
  variant?: 'default' | 'compact';
  showAuthor?: boolean;
}

export function ArticlePreview({ post, variant = 'default', showAuthor = true }: ArticlePreviewProps) {
  const { data: author } = useAuthor(post.pubkey);
  const metadata = author?.metadata;

  const title = post.tags.find(([name]: [string]) => name === 'title')?.[1] || 'Untitled';
  const summary = post.tags.find(([name]: [string]) => name === 'summary')?.[1];
  const image = post.tags.find(([name]: [string]) => name === 'image')?.[1];
  const publishedAt = post.tags.find(([name]: [string]) => name === 'published_at')?.[1];
  const identifier = post.tags.find(([name]: [string]) => name === 'd')?.[1] || '';
  const hashtags = post.tags
    .filter(([name]: [string]) => name === 't')
    .map(([, value]: [string, string]) => value)
    .slice(0, 3);

  const date = publishedAt
    ? new Date(parseInt(publishedAt) * 1000)
    : new Date(post.created_at * 1000);

  const naddr = nip19.naddrEncode({
    kind: post.kind,
    pubkey: post.pubkey,
    identifier,
  });

  const displayName = metadata?.name || metadata?.display_name || genUserName(post.pubkey);
  const avatarUrl = metadata?.picture;

  const isCompact = variant === 'compact';
  const titleSize = isCompact ? 'text-lg' : 'text-xl sm:text-2xl';
  const summaryLines = isCompact ? 'line-clamp-2' : 'line-clamp-3';
  const dateFormat = isCompact
    ? { month: 'short', day: 'numeric', year: 'numeric' }
    : { year: 'numeric', month: 'long', day: 'numeric' };

  const valid = isValidDate(date);

  return (
    <Link to={`/${naddr}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        {image && (
          <div className="aspect-video overflow-hidden bg-muted">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="flex-1">
          <h3 className={`${titleSize} font-bold line-clamp-2 mb-2`}>
            {title}
          </h3>
          {summary && (
            <p className={`text-muted-foreground text-sm ${summaryLines}`}>
              {summary}
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {valid && (
            <div className={`flex items-center gap-2 text-xs text-muted-foreground ${showAuthor || hashtags.length > 0 ? 'mb-3' : ''}`}>
              <Calendar className="h-3 w-3" />
              <time dateTime={toISOStringSafe(date)}>
                {date.toLocaleDateString('en-US', dateFormat as Intl.DateTimeFormatOptions)}
              </time>
            </div>
          )}
          {showAuthor && (
            <div className={`flex items-center gap-2 ${hashtags.length > 0 ? 'mb-3' : ''}`}>
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-xs">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium truncate">{displayName}</span>
            </div>
          )}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
