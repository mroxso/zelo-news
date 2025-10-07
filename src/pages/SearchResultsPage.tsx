import { useSearchParams, Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { useSearch } from '@/hooks/useSearch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { ArticlePreview } from '@/components/ArticlePreview';
import type { NostrMetadata } from '@nostrify/nostrify';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  
  const { data: results, isLoading } = useSearch(searchTerm, true);

  const profiles = results?.filter(r => r.type === 'profile') || [];
  const articles = results?.filter(r => r.type === 'article') || [];

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-6xl py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
        {/* Loading skeletons */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
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
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with back button and search */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Search term heading */}
        {searchTerm && (
          <div>
            <h1 className="text-3xl font-bold">
              {searchTerm.startsWith('#') ? (
                <>Articles tagged with "{searchTerm}"</>
              ) : (
                <>Search Results for "{searchTerm}"</>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Found {results?.length || 0} {searchTerm.startsWith('#') ? 'articles' : 'results'}
            </p>
          </div>
        )}

        {/* No results */}
        {!isLoading && (!results || results.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="py-12 px-8 text-center">
              <p className="text-muted-foreground">
                No results found for "{searchTerm}". Try a different search term.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profiles section */}
        {profiles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              Profiles ({profiles.length})
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((result) => {
                let metadata: NostrMetadata = {};
                try {
                  metadata = JSON.parse(result.event.content);
                } catch {
                  // Invalid JSON
                }

                const displayName = metadata.display_name || metadata.name || 'Anonymous';
                const nip05 = metadata.nip05;
                const picture = metadata.picture;
                const about = metadata.about;
                const npub = nip19.npubEncode(result.event.pubkey);

                return (
                  <Link key={result.event.id} to={`/${npub}`}>
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={picture} alt={displayName} />
                            <AvatarFallback>
                              <User className="h-10 w-10" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 w-full">
                            <h3 className="font-semibold text-lg truncate">{displayName}</h3>
                            {nip05 && (
                              <p className="text-xs text-muted-foreground truncate">{nip05}</p>
                            )}
                          </div>
                          {about && (
                            <p className="text-sm text-muted-foreground line-clamp-3 w-full">
                              {about}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Profile
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Articles section */}
        {articles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Articles ({articles.length})
            </h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((result) => (
                <ArticlePreview key={result.event.id} post={result.event} showAuthor={true} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
