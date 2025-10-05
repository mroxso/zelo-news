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
    <div className={cn('prose prose-slate dark:prose-invert max-w-none break-words overflow-wrap-anywhere', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
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
