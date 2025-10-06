import { useParams } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useAuthor } from '@/hooks/useAuthor';
import { useAuthorBlogPosts } from '@/hooks/useAuthorBlogPosts';
import { useUserBookmarkedArticles } from '@/hooks/useUserBookmarkedArticles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, Mail, Copy, Check, Bookmark } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { RelaySelector } from '@/components/RelaySelector';
import { ArticlePreview } from '@/components/ArticlePreview';
import { FollowButton } from '@/components/FollowButton';
import { useToast } from '@/hooks/useToast';
import NotFound from '@/pages/NotFound';
import { useState } from 'react';

export default function ProfilePage() {
  const { nip19: npub } = useParams<{ nip19: string }>();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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
  const { data: bookmarkedArticles, isLoading: bookmarksLoading } = useUserBookmarkedArticles(pubkey);
  
  const metadata = author.data?.metadata;
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const userName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const banner = metadata?.banner;
  const about = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;

  // Generate npub for copy button
  const userNpub = pubkey ? nip19.npubEncode(pubkey) : '';

  const handleCopyNpub = async () => {
    try {
      await navigator.clipboard.writeText(userNpub);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "npub copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy npub to clipboard",
        variant: "destructive",
      });
    }
  };

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
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{displayName}</h1>
                    <div className="flex items-center gap-2">
                      <FollowButton pubkey={pubkey} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyNpub}
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy npub</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
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

        {/* Content Tabs */}
        <div className="mt-8 px-4 md:px-0">
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="articles" className="flex-1 md:flex-initial">
                Published Articles
                {posts && posts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {posts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex-1 md:flex-initial">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarks
                {bookmarkedArticles && bookmarkedArticles.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {bookmarkedArticles.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Published Articles Tab */}
            <TabsContent value="articles" className="space-y-6">
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
                  {posts.map((post) => (
                    <ArticlePreview key={post.id} post={post} showAuthor={false} />
                  ))}
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
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks" className="space-y-6">
              {bookmarksLoading ? (
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
              ) : bookmarkedArticles && bookmarkedArticles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedArticles.map((post) => (
                    <ArticlePreview key={post.id} post={post} showAuthor={true} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <Bookmark className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No Bookmarks</h3>
                        <p className="text-muted-foreground">
                          This user hasn't bookmarked any articles yet.
                        </p>
                      </div>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
