import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { cn } from '@/lib/utils';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown content with support for Nostr URIs (nostr:npub1..., nostr:note1..., etc.)
 * Used for rendering NIP-23 long-form blog posts
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn('prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h5:text-lg prose-h6:text-base max-w-none break-words overflow-wrap-anywhere select-text', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading renderers with explicit styling
          h1: ({ node, children, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="text-3xl font-bold mt-6 mb-3" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="text-2xl font-bold mt-5 mb-2" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 className="text-xl font-bold mt-4 mb-2" {...props}>
              {children}
            </h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5 className="text-lg font-bold mt-3 mb-1" {...props}>
              {children}
            </h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6 className="text-base font-bold mt-2 mb-1" {...props}>
              {children}
            </h6>
          ),
          // Custom link renderer to handle nostr: URIs
          a: ({ node, href, children, ...props }) => {
            // Handle nostr: URIs
            if (href?.startsWith('nostr:')) {
              const nostrId = href.substring(6); // Remove "nostr:" prefix
              
              try {
                // Validate it's a proper NIP-19 identifier
                nip19.decode(nostrId);
                
                return (
                  <Link
                    to={`/${nostrId}`}
                    className="text-blue-500 hover:underline break-all"
                  >
                    {children}
                  </Link>
                );
              } catch {
                // If decoding fails, render as plain text
                return <span>{children}</span>;
              }
            }
            
            // Regular links open in new tab
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Style code blocks
          code: ({ node, className, children, ...props }) => {
            const isInline = !className;
            return (
              <code
                className={cn(
                  isInline
                    ? 'bg-muted px-1.5 py-0.5 rounded text-sm'
                    : 'block bg-muted p-4 rounded-lg overflow-x-auto',
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style images
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
          ),
          // Style blockquotes
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/20 pl-4 italic my-4"
              {...props}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
