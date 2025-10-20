import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bookmark, PenSquare, User as UserIcon } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { nip19 } from 'nostr-tools';

export function BottomNav() {
  const { user, metadata } = useCurrentUser();
  const location = useLocation();

  const profilePath = user ? `/${nip19.npubEncode(user.pubkey)}` : '/';

  const isActive = (pathStartsWith: string | string[]) => {
    const paths = Array.isArray(pathStartsWith) ? pathStartsWith : [pathStartsWith];
    return paths.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));
  };

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-5 h-16 items-center">
          <li className="flex items-stretch">
            <Link
              to="/"
              aria-label="Home"
              className={
                'flex-1 flex items-center justify-center gap-1 text-sm transition-colors ' +
                (isActive('/') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          <li className="flex items-stretch">
            <Link
              to="/following"
              aria-label="Following"
              className={
                'flex-1 flex items-center justify-center gap-1 text-sm transition-colors ' +
                (isActive('/following') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
            >
              <Users className="h-5 w-5" />
              <span className="sr-only">Following</span>
            </Link>
          </li>
          <li className="flex items-stretch">
            <Link
              to="/bookmarks"
              aria-label="Bookmarks"
              className={
                'flex-1 flex items-center justify-center gap-1 text-sm transition-colors ' +
                (isActive('/bookmarks') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
            >
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Bookmarks</span>
            </Link>
          </li>
          <li className="flex items-stretch">
            <Link
              to="/create"
              aria-label="Create"
              className={
                'flex-1 flex items-center justify-center gap-1 text-sm transition-colors ' +
                (isActive('/create') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
            >
              <PenSquare className="h-5 w-5" />
              <span className="sr-only">Create</span>
            </Link>
          </li>
          <li className="flex items-stretch">
            <Link
              to={profilePath}
              aria-label="Profile"
              className={
                'flex-1 flex items-center justify-center gap-1 text-sm transition-colors ' +
                (isActive(profilePath) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')
              }
            >
              {user ? (
                <Avatar className="h-7 w-7">
                  {metadata?.picture ? (
                    <AvatarImage src={metadata.picture} alt={metadata?.display_name || metadata?.name || 'Profile'} />
                  ) : (
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Profile</span>
            </Link>
          </li>
        </ul>
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
