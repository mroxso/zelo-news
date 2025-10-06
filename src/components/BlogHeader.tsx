import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';
import { PenSquare, Menu, Bookmark, Users, Highlighter } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export function BlogHeader() {
  const { user } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <ThemeToggle />
          <LoginArea className="max-w-60" />
        </div>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">
                {/* Theme Toggle in Menu */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>

                {/* Login Area in Menu */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Account</span>
                  <LoginArea className="w-full" />
                </div>

                {/* Navigation for logged in users */}
                {user && (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <Button variant="outline" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link to="/following">
                          <Users className="h-4 w-4 mr-2" />
                          Following
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link to="/bookmarks">
                          <Bookmark className="h-4 w-4 mr-2" />
                          Bookmarks
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link to="/highlights">
                          <Highlighter className="h-4 w-4 mr-2" />
                          Highlights
                        </Link>
                      </Button>
                      <Button variant="default" className="w-full" asChild onClick={() => setIsMenuOpen(false)}>
                        <Link to="/create">
                          <PenSquare className="h-4 w-4 mr-2" />
                          New Post
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
