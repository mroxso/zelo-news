import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface QuoteHighlightDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The selected text to highlight */
  selectedText: string;
  /** Callback when user submits the quote highlight */
  onSubmit: (comment: string) => void;
  /** Whether submission is in progress */
  isPending?: boolean;
}

/**
 * Dialog for creating a quote highlight with user commentary
 * 
 * @example
 * ```tsx
 * <QuoteHighlightDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   selectedText={selectedText}
 *   onSubmit={handleQuoteHighlight}
 *   isPending={isPending}
 * />
 * ```
 */
export function QuoteHighlightDialog({
  open,
  onOpenChange,
  selectedText,
  onSubmit,
  isPending = false,
}: QuoteHighlightDialogProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit(comment.trim());
    setComment('');
  };

  const handleCancel = () => {
    setComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quote Highlight
          </DialogTitle>
          <DialogDescription>
            Add your thoughts or commentary to this highlight
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Show the selected text */}
          <div className="rounded-lg bg-muted p-4 border-l-4 border-primary">
            <p className="text-sm text-muted-foreground italic">
              "{selectedText}"
            </p>
          </div>

          {/* Comment textarea */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Your thoughts
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What makes this passage interesting or valuable?"
              className="min-h-[120px]"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Your comment will be visible to everyone who sees this highlight
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || isPending}
          >
            {isPending ? 'Sharing...' : 'Share Highlight'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
