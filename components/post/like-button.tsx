import { Button } from "@/components/ui/button";
import {
  useLiked,
  useLikePost,
  useLikesCountByPostId,
  useUnlikePost,
} from "@/lib/hooks/useLike";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { FC, MouseEvent } from "react";

interface LikeButtonProps {
  postId?: number;
  className?: string;
}

const LikeButton: FC<LikeButtonProps> = ({ postId, className }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: likesCount } = useLikesCountByPostId(post?.id);

  const { data: liked } = useLiked({ userId, postId: post?.id });

  const likePost = useLikePost();
  const handleLike = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && likePost.mutate({ userId, postId: post.id });
  };

  const unlikePost = useUnlikePost();
  const handleUnlike = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && unlikePost.mutate({ userId, postId: post.id });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={liked ? handleUnlike : handleLike}
      className={cn(
        "-m-2 h-auto gap-1 p-2 font-normal hover:bg-red-500/10 hover:text-red-500",
        liked && "text-red-500",
      )}
    >
      {liked ? (
        <HeartSolid className={cn(className)} />
      ) : (
        <HeartOutline className={cn("stroke-2", className)} />
      )}
      {!!likesCount && <span className="text-xs">{likesCount}</span>}
    </Button>
  );
};

export default LikeButton;
