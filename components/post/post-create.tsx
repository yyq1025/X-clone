import { after } from "node:test";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAddPost, usePostById } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { useUserStore } from "@/lib/stores/user";
import { cn } from "@/lib/utils";
import { FC, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface PostCreateProps {
  className?: string;
  parentId?: string | null;
  minRows?: number;
  maxRows?: number;
  afterSubmit?: () => void;
}

const PostCreate: FC<PostCreateProps> = ({
  className,
  parentId = null,
  minRows = 1,
  maxRows = 25,
  afterSubmit,
}) => {
  const { userId } = useUserStore();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: user } = useUserById(userId);
  const { data: parent } = usePostById(parentId);

  const addPost = useAddPost();

  const handleSubmit = async () => {
    setSubmitting(true);
    const mentions = (parent?.mentions || [])
      .filter((mention) => mention !== userId)
      .concat([userId as string]);
    await addPost.mutateAsync({
      parentId,
      ownerId: userId as string,
      content,
      mentions,
    });
    setContent("");
    setSubmitting(false);
    afterSubmit?.();
  };

  return (
    <div className={cn("flex flex-col px-4", className)}>
      <div className="flex">
        <div className="mr-2 basis-10 pt-3">
          <Avatar>
            <AvatarImage src={user?.avatar || ""} alt={user?.name || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex grow basis-0 flex-col justify-center pt-1">
          <div className="inline-flex w-full py-3">
            <TextareaAutosize
              className="w-full resize-none text-lg outline-none"
              placeholder={parent ? "Post your reply" : "What is happening?!"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minRows={minRows}
              maxRows={maxRows}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end pb-2">
        <Button
          size="sm"
          className="mt-2"
          onClick={handleSubmit}
          disabled={content === "" || submitting}
        >
          {parent ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );
};

export default PostCreate;
