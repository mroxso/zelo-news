import { ReactNode } from 'react';
import { Header } from './Header';
import packageJson from '../../package.json';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-8">
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
