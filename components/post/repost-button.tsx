import { Button } from "@/components/ui/button";
import { usePostById } from "@/lib/hooks/usePost";
import {
  useRepost,
  useRepostCountByPostId,
  useReposted,
  useUnrepost,
} from "@/lib/hooks/useRepost";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/outline";
import { FC, MouseEvent } from "react";

interface RepostButtonProps {
  postId?: number;
  className?: string;
}

const RepostButton: FC<RepostButtonProps> = ({ postId, className }) => {
  const { userId } = useUserStore();

  const { data: post } = usePostById(postId);

  const { data: repostCount } = useRepostCountByPostId(post?.id);

  const { data: reposted } = useReposted({ userId, postId: post?.id });

  const repost = useRepost();
  const handleRepost = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && repost.mutate({ userId, postId: post.id });
  };

  const unrepost = useUnrepost();
  const handleUnrepost = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    userId && post && unrepost.mutate({ userId, postId: post.id });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={reposted ? handleUnrepost : handleRepost}
      className={cn(
        "-m-2 h-auto gap-1 p-2 font-normal hover:bg-green-500/10 hover:text-green-500",
        reposted && "text-green-500",
      )}
    >
      <ArrowPathRoundedSquareIcon className={cn("stroke-2", className)} />
      {!!repostCount && <span className="text-xs">{repostCount}</span>}
    </Button>
  );
};

export default RepostButton;
