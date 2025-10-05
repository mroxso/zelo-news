import { useParams, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorBlogPosts } from '@/hooks/useAuthorBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Link2, Mail } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { RelaySelector } from '@/components/RelaySelector';
import NotFound from '@/pages/NotFound';

export default function ProfilePage() {
  const { nip19: npub } = useParams<{ nip19: string }>();

  // Decode npub/nprofile to get pubkey
  let pubkey = '';
  let isValidProfile = false;
  
  try {
    if (npub?.startsWith('npub1')) {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        pubkey = decoded.data;
        isValidProfile = true;
      }
    } else if (npub?.startsWith('nprofile1')) {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'nprofile') {
        pubkey = decoded.data.pubkey;
        isValidProfile = true;
      }
    }
  } catch (error) {
    console.error('Failed to decode npub:', error);
  }

  const author = useAuthor(pubkey);
  const { data: posts, isLoading: postsLoading } = useAuthorBlogPosts(pubkey);
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const userName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const banner = metadata?.banner;
  const about = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;

  // If not a valid profile identifier, show 404
  if (!isValidProfile || !pubkey) {
    return <NotFound />;
  }

  // Loading state
  if (author.isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-0 md:py-8">
          {/* Banner skeleton */}
          <Skeleton className="h-48 md:h-64 w-full md:rounded-t-lg" />
          
          {/* Profile info skeleton */}
          <Card className="border-t-0 rounded-t-none md:rounded-t-none">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full -mt-16 md:-mt-20 border-4 border-background" />
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <Skeleton className="h-4 w-3/4 max-w-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts skeleton */}
          <div className="mt-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl py-0 md:py-8 px-0 md:px-4">
        {/* Banner */}
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-br from-primary/20 to-primary/5 md:rounded-t-lg overflow-hidden">
          {banner && (
            <img 
              src={banner} 
              alt="Profile banner" 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <Card className="border-t-0 rounded-t-none md:rounded-t-none border-x-0 md:border-x">
          <CardContent className="pt-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 md:h-32 md:w-32 -mt-16 md:-mt-20 border-4 border-background ring-2 ring-background">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="text-2xl md:text-4xl">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                  {metadata?.name && metadata.name !== displayName && (
                    <p className="text-muted-foreground">@{userName}</p>
                  )}
                  {nip05 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{nip05}</span>
                    </div>
                  )}
                </div>

                {about && (
                  <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap max-w-2xl">
                    {about}
                  </p>
                )}

                {website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4" />
                    <a 
                      href={website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts Section */}
        <div className="mt-8 px-4 md:px-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold">Blog Posts</h2>
            {posts && posts.length > 0 && (
              <Badge variant="secondary" className="text-sm">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </Badge>
            )}
          </div>

          {postsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const title = post.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
                const summary = post.tags.find(([name]) => name === 'summary')?.[1];
                const image = post.tags.find(([name]) => name === 'image')?.[1];
                const publishedAt = post.tags.find(([name]) => name === 'published_at')?.[1];
                const tags = post.tags.filter(([name]) => name === 't').map(([, value]) => value);
                const identifier = post.tags.find(([name]) => name === 'd')?.[1];

                const naddr = nip19.naddrEncode({
                  kind: post.kind,
                  pubkey: post.pubkey,
                  identifier: identifier || '',
                });

                const date = publishedAt 
                  ? new Date(parseInt(publishedAt) * 1000)
                  : new Date(post.created_at * 1000);

                return (
                  <Link key={post.id} to={`/${naddr}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                      {image && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={image} 
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader className="space-y-3">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        {summary && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={date.toISOString()}>
                            {date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    No blog posts found from this author. Try another relay?
                  </p>
                  <RelaySelector className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
