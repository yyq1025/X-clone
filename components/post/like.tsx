import { ButtonProps } from "@/components/ui/button";
import {
  useLiked,
  useLikePost,
  useLikesCountByPostId,
  useUnlikePost,
} from "@/lib/hooks/useLike";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import { FC, MouseEvent, ReactNode } from "react";

interface LikeProps {
  postId?: string;
  render: (props: {
    buttonProps: ButtonProps;
    likesCount?: number | null;
    liked?: boolean;
  }) => ReactNode;
}

const Like: FC<LikeProps> = ({ postId, render }) => {
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

  return render({
    buttonProps: { onClick: liked ? handleUnlike : handleLike },
    likesCount,
    liked,
  });
};

export default Like;
