import { useState } from 'react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, Copy, Check, Bookmark, BadgeCheck, Zap, Highlighter, FileText } from 'lucide-react';
import { genUserName } from '@/lib/genUserName';
import { RelayListManager } from '@/components/RelayListManager';
import { ArticlePreview } from '@/components/ArticlePreview';
import { Highlight } from '@/components/highlights/Highlight';
import { FollowButton } from '@/components/FollowButton';
import { useToast } from '@/hooks/useToast';

interface ProfileViewProps {
  pubkey: string;
  metadata?: NostrMetadata;
  posts?: NostrEvent[];
  bookmarkedArticles?: NostrEvent[];
  highlights?: NostrEvent[];
  postsLoading?: boolean;
  bookmarksLoading?: boolean;
  highlightsLoading?: boolean;
}

export function ProfileView({
  pubkey,
  metadata,
  posts,
  bookmarkedArticles,
  highlights,
  postsLoading = false,
  bookmarksLoading = false,
  highlightsLoading = false,
}: ProfileViewProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const userName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const banner = metadata?.banner;
  const about = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;

  // Generate npub for copy button
  const userNpub = nip19.npubEncode(pubkey);

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
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                      <span>{nip05}</span>
                    </div>
                  )}
                  {metadata?.lud16 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>{metadata.lud16}</span>
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
              <TabsTrigger value="articles" className="flex-1 md:flex-initial" aria-label="Published Articles">
                <FileText className="h-4 w-4" />
                {posts && posts.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {posts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex-1 md:flex-initial" aria-label="Bookmarks">
                <Bookmark className="h-4 w-4" />
                {bookmarkedArticles && bookmarkedArticles.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {bookmarkedArticles.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="highlights" className="flex-1 md:flex-initial" aria-label="Highlights">
                <Highlighter className="h-4 w-4" />
                {highlights && highlights.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {highlights.length}
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
                      <RelayListManager />
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
                      <RelayListManager />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Highlights Tab */}
            <TabsContent value="highlights" className="space-y-6">
              {highlightsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-l-4 border-l-yellow-500/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : highlights && highlights.length > 0 ? (
                <div className="space-y-4">
                  {highlights.map((highlight) => (
                    <Highlight key={highlight.id} highlight={highlight} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <Highlighter className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No Highlights</h3>
                        <p className="text-muted-foreground">
                          This user hasn't created any highlights yet.
                        </p>
                      </div>
                      <RelayListManager />
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
