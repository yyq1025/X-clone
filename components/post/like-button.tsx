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
import { Heart } from "lucide-react";
import { FC, MouseEvent } from "react";

interface LikeButtonProps {
  postId?: number;
  size: number;
}

const LikeButton: FC<LikeButtonProps> = ({ postId, size }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: likesCount } = useLikesCountByPostId(post?.id);

  const { data: liked } = useLiked({ userId, postId: post?.id });

  const likePost = useLikePost();
  const handleLike = (event: MouseEvent) => {
    event.preventDefault();
    userId && post && likePost.mutate({ userId, postId: post.id });
  };

  const unlikePost = useUnlikePost();
  const handleUnlike = (event: MouseEvent) => {
    event.preventDefault();
    userId && post && unlikePost.mutate({ userId, postId: post.id });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={liked ? handleUnlike : handleLike}
      className={cn(
        "-m-2 h-8 gap-1 p-2 font-normal hover:bg-red-500/10 hover:text-red-500",
        liked && "text-red-500",
      )}
    >
      <Heart size={size} className={cn(liked && "fill-current")} />
      {!!likesCount && <span className="text-xs">{likesCount}</span>}
    </Button>
  );
};

export default LikeButton;
