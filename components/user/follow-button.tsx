import { Button } from "@/components/ui/button";
import { useFollow, useFollowed, useUnfollow } from "@/lib/hooks/useFollow";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { FC, MouseEvent } from "react";

interface FollowButtonProps {
  uid?: string;
  className?: string;
}

const FollowButton: FC<FollowButtonProps> = ({ uid, className }) => {
  const { userId } = useUserStore();
  const { data: followed } = useFollowed({
    followerId: userId,
    followingId: uid,
  });

  const follow = useFollow();
  const handleFollow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && uid && follow.mutate({ followerId: userId, followingId: uid });
  };

  const unfollow = useUnfollow();
  const handleUnfollow = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && uid && unfollow.mutate({ followerId: userId, followingId: uid });
  };

  if (userId === uid) return null;

  return (
    <>
      {followed ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleUnfollow}
          className={cn(
            "after:content-['Following'] hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:after:content-['Unfollow']",
            className,
          )}
        />
      ) : (
        <Button size="sm" onClick={handleFollow} className={cn(className)}>
          Follow
        </Button>
      )}
    </>
  );
};

export default FollowButton;
