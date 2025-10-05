import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToggleBookmark } from '@/hooks/useToggleBookmark';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  articleCoordinate: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

/**
 * Button component to bookmark/unbookmark articles using NIP-51.
 * Shows filled bookmark icon when bookmarked, outline when not.
 */
export function BookmarkButton({
  articleCoordinate,
  className,
  variant = 'ghost',
  size = 'icon',
  showText = false,
}: BookmarkButtonProps) {
  const { user } = useCurrentUser();
  const { data: bookmarks = [] } = useBookmarks();
  const { mutate: toggleBookmark, isPending } = useToggleBookmark();
  const { toast } = useToast();

  const isBookmarked = bookmarks.includes(articleCoordinate);

  const handleClick = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to bookmark articles',
        variant: 'destructive',
      });
      return;
    }

    toggleBookmark(
      { articleCoordinate },
      {
        onSuccess: ({ isBookmarked: newState }) => {
          toast({
            title: newState ? 'Bookmarked!' : 'Removed from bookmarks',
            description: newState
              ? 'Article added to your bookmarks'
              : 'Article removed from your bookmarks',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update bookmark',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending || !user}
      className={cn(className)}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this article'}
    >
      <Bookmark
        className={cn(
          'h-4 w-4',
          isBookmarked && 'fill-current'
        )}
      />
      {showText && (
        <span className="ml-2">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  );
}
