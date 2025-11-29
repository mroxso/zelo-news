import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';
import { PenSquare, Bookmark, Users, Settings, Highlighter } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <span className="font-bold text-lg sm:text-xl">
              zelo.news
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/following">
                  <Users className="h-4 w-4 mr-2" />
                  Following
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/bookmarks">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Bookmarks
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/highlights">
                  <Highlighter className="h-4 w-4 mr-2" />
                  Highlights
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/create">
                  <PenSquare className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </nav>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <LoginArea className="max-w-60" />
        </div>

        {/* Mobile: show LoginArea in header (bottom nav is still used for nav) */}
        <div className="sm:hidden flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <LoginArea className='pl-2' />
        </div>
      </div>
    </header>
  );
}
