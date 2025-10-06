import { UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToggleFollow } from '@/hooks/useToggleFollow';
import { useFollowing } from '@/hooks/useFollowing';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  pubkey: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

/**
 * Button component to follow/unfollow users using NIP-02 (kind 3 contact list).
 * Shows filled icon when following, outline when not.
 * Only visible to logged-in users.
 */
export function FollowButton({
  pubkey,
  className,
  variant = 'outline',
  size = 'sm',
  showText = true,
}: FollowButtonProps) {
  const { user } = useCurrentUser();
  const { data: followingList = [] } = useFollowing();
  const { mutate: toggleFollow, isPending } = useToggleFollow();
  const { toast } = useToast();

  const isFollowing = followingList.includes(pubkey);

  // Don't show button if user is not logged in or viewing their own profile
  if (!user || user.pubkey === pubkey) {
    return null;
  }

  const handleClick = () => {
    toggleFollow(
      { pubkey },
      {
        onSuccess: ({ isFollowing: newState }) => {
          toast({
            title: newState ? 'Following!' : 'Unfollowed',
            description: newState
              ? 'User added to your following list'
              : 'User removed from your following list',
          });
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update following list',
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
      disabled={isPending}
      className={cn(className)}
      title={isFollowing ? 'Unfollow this user' : 'Follow this user'}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          {showText && <span className="ml-2 hidden sm:inline">Unfollow</span>}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && <span className="ml-2 hidden sm:inline">Follow</span>}
        </>
      )}
    </Button>
  );
}
