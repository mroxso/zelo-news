import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, MessageSquare } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HighlightButtonProps {
  /** Callback when user clicks "Highlight" */
  onHighlight: (text: string) => void;
  /** Callback when user clicks "Quote Highlight" */
  onQuoteHighlight: (text: string) => void;
  /** Whether a highlight operation is in progress */
  isPending?: boolean;
}

/**
 * Text selection toolbar that appears when user selects text
 * Provides "Highlight" and "Quote Highlight" actions
 * 
 * @example
 * ```tsx
 * <div onMouseUp={() => checkSelection()}>
 *   <MarkdownContent content={article.content} />
 *   <HighlightButton
 *     onHighlight={handleHighlight}
 *     onQuoteHighlight={handleQuoteHighlight}
 *   />
 * </div>
 * ```
 */
export function HighlightButton({
  onHighlight,
  onQuoteHighlight,
  isPending = false,
}: HighlightButtonProps) {
  const [selectedText, setSelectedText] = useState('');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useCurrentUser();
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0 && text.length <= 500) {
        // Get selection position
        const range = selection?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();

        if (rect) {
          // Position toolbar above the selection
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 10,
          });
          setSelectedText(text);
        }
      } else {
        // Clear if selection is too long or empty
        setPosition(null);
        setSelectedText('');
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Close toolbar if clicking outside
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Don't close if clicking in the selected text
        const selection = window.getSelection();
        if (!selection?.toString().trim()) {
          setPosition(null);
          setSelectedText('');
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHighlightClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    onHighlight(selectedText);
    // Clear selection
    window.getSelection()?.removeAllRanges();
    setPosition(null);
    setSelectedText('');
  };

  const handleQuoteClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    onQuoteHighlight(selectedText);
    // Keep selection for the dialog
  };

  if (!position || !selectedText) {
    return null;
  }

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-50 animate-in fade-in-0 zoom-in-95"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="bg-background border rounded-lg shadow-lg p-1 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleHighlightClick}
            disabled={isPending}
            className="gap-2"
          >
            <Highlighter className="h-4 w-4" />
            Highlight
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleQuoteClick}
            disabled={isPending}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Quote
          </Button>
        </div>
      </div>

      {/* Login popover */}
      <Popover open={showLogin} onOpenChange={setShowLogin}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sign in to highlight</h4>
              <p className="text-sm text-muted-foreground">
                You need to be logged in to save highlights
              </p>
            </div>
            <LoginArea className="flex" />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
