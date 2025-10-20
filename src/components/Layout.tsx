import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import packageJson from '../../package.json';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Add bottom padding on mobile so content isn't hidden behind the bottom nav */}
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>
      {/* Mobile-only bottom navigation */}
      <BottomNav />
      {/* Add extra bottom padding on mobile so footer content can scroll above the BottomNav overlay */}
      <footer className="border-t pt-6 pb-24 sm:pb-8 md:pt-8">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Powered by Nostr</p>
            <p>Version {packageJson.version}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
