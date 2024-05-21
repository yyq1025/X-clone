import { ButtonProps } from "@/components/ui/button";
import {
  useLiked,
  useLikePost,
  useLikesCountByPostId,
  useUnlikePost,
} from "@/lib/hooks/useLike";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserStore } from "@/lib/stores/user";
import type { Post } from "@prisma/client";
import { FC, MouseEvent, ReactNode } from "react";

interface LikeProps {
  postId?: string;
  render: (props: {
    buttonProps: ButtonProps;
    likesCount?: number;
    liked?: boolean;
  }) => ReactNode;
}

const Like: FC<LikeProps> = ({ postId, render }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: likesCount } = useLikesCountByPostId(post?.postId);

  const { data: liked } = useLiked({ userId, postId: post?.postId });

  const likePost = useLikePost();

  const handleLike = (event: MouseEvent) => {
    event.stopPropagation();
    post?.postId && likePost.mutate({ userId, postId: post?.postId });
  };

  const unlikePost = useUnlikePost();
  const handleUnlike = (event: MouseEvent) => {
    event.stopPropagation();
    post?.postId && unlikePost.mutate({ userId, postId: post?.postId });
  };

  return render({
    buttonProps: { onClick: liked ? handleUnlike : handleLike },
    likesCount,
    liked,
  });
};

export default Like;
