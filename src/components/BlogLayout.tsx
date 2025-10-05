import { ReactNode } from 'react';
import { BlogHeader } from './BlogHeader';

interface BlogLayoutProps {
  children: ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Powered by Nostr</p>
            {/* <p>
              Vibed with{' '}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                MKStack
              </a>
            </p> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
