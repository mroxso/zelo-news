import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { Search, User, FileText, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NostrMetadata } from '@nostrify/nostrify';

export function SearchBar({ className }: { className?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { data: results, isLoading } = useSearch(searchTerm, showResults);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: 'profile' | 'article', pubkey: string, identifier?: string) => {
    setShowResults(false);
    setSearchTerm('');

    if (type === 'profile') {
      const npub = nip19.npubEncode(pubkey);
      navigate(`/${npub}`);
    } else if (type === 'article' && identifier) {
      const naddr = nip19.naddrEncode({
        kind: 30023,
        pubkey,
        identifier,
      });
      navigate(`/${naddr}`);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.length >= 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      setShowResults(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users, articles, #tags..."
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
          className="pl-9 pr-4"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && searchTerm.length >= 2 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-auto shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results && results.length > 0 ? (
              <div className="divide-y">
                {results.map((result, index) => {
                  if (result.type === 'profile') {
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

                    return (
                      <button
                        key={`profile-${result.event.id}-${index}`}
                        onClick={() => handleResultClick('profile', result.event.pubkey)}
                        className="w-full p-3 hover:bg-muted/50 transition-colors flex items-start gap-3 text-left"
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={picture} alt={displayName} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Profile
                            </Badge>
                          </div>
                          <div className="font-medium mt-1 truncate">{displayName}</div>
                          {nip05 && (
                            <div className="text-xs text-muted-foreground truncate">{nip05}</div>
                          )}
                          {about && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {about}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  } else {
                    const title = result.event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
                    const summary = result.event.tags.find(([name]) => name === 'summary')?.[1];
                    const identifier = result.event.tags.find(([name]) => name === 'd')?.[1] || '';
                    const image = result.event.tags.find(([name]) => name === 'image')?.[1];

                    return (
                      <button
                        key={`article-${result.event.id}-${index}`}
                        onClick={() => handleResultClick('article', result.event.pubkey, identifier)}
                        className="w-full p-3 hover:bg-muted/50 transition-colors flex items-start gap-3 text-left"
                      >
                        {image ? (
                          <div className="h-10 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                            <img
                              src={image}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              Article
                            </Badge>
                          </div>
                          <div className="font-medium mt-1 line-clamp-1">{title}</div>
                          {summary && (
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {summary}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
