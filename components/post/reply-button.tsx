import { Button } from "@/components/ui/button";
import { usePostById, useRepliesCount } from "@/lib/hooks/usePost";
import { usePostModalStore } from "@/lib/stores/postModal";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, MouseEvent } from "react";

interface ReplyButtonProps {
  postId?: number;
  size: number;
}

const ReplyButton: FC<ReplyButtonProps> = ({ postId, size }) => {
  const router = useRouter();
  const { setParentId } = usePostModalStore();
  const { data: post } = usePostById(postId);
  const { data: repliesCount } = useRepliesCount(post?.id);

  const openReplyModal = (event: MouseEvent) => {
    event.preventDefault();
    setParentId(post?.id);
    router.push("/compose/post", { scroll: false });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openReplyModal}
      className="-m-2 h-8 gap-1 p-2 font-normal hover:bg-primary/10 hover:text-primary"
    >
      <MessageSquare size={size} />
      {!!repliesCount && <span className="text-xs">{repliesCount}</span>}
    </Button>
  );
};

export default ReplyButton;
