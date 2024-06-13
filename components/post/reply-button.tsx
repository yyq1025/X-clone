import { Button } from "@/components/ui/button";
import { usePostById, useRepliesCount } from "@/lib/hooks/usePost";
import { usePostModalStore } from "@/lib/stores/postModal";
import { cn } from "@/lib/utils";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { FC, MouseEvent } from "react";

interface ReplyButtonProps {
  postId?: number;
  className?: string;
}

const ReplyButton: FC<ReplyButtonProps> = ({ postId, className }) => {
  const router = useRouter();
  const { setParentId } = usePostModalStore();
  const { data: post } = usePostById(postId);
  const { data: repliesCount } = useRepliesCount(post?.id);

  const openReplyModal = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setParentId(post?.id);
    router.push("/compose/post", { scroll: false });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openReplyModal}
      className="-m-2 h-auto gap-1 p-2 font-normal hover:bg-primary/10 hover:text-primary"
    >
      <ChatBubbleLeftIcon className={cn("stroke-2", className)} />
      {!!repliesCount && <span className="text-xs">{repliesCount}</span>}
    </Button>
  );
};

export default ReplyButton;
