import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonProps } from "@/components/ui/button";
import { usePostById, useRepliesCount } from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { FC, MouseEvent, ReactNode, useState } from "react";

import PostCreate from "./post-create";

interface ReplyModalProps {
  postId?: string;
  renderTrigger: (props: {
    buttonProps: ButtonProps;
    repliesCount?: number;
  }) => ReactNode;
}

const ReplyModal: FC<ReplyModalProps> = ({ postId, renderTrigger }) => {
  const [open, setOpen] = useState(false);

  const { data: parent } = usePostById(postId);
  const { data: parentOwner } = useUserById(parent?.ownerId);

  const { users: parentMentions } = useUsersByIds(parent?.mentions);

  const { data: repliesCount } = useRepliesCount(parent?.postId);

  return (
    <>
      {renderTrigger({
        buttonProps: {
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            setOpen(true);
          },
        },
        repliesCount: repliesCount,
      })}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed top-0 z-[2] flex h-full w-screen items-start justify-center bg-black/40"
      >
        <DialogPanel className="relative top-[5%] flex min-w-[600px] shrink flex-col rounded-xl bg-white">
          <div className="flex h-[53px] w-full items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="rounded-full p-2"
            >
              <X size={20} />
            </Button>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col px-4">
              <div className="pt-3" />
              <div className="flex">
                <div className="mr-2 flex basis-10 flex-col items-center">
                  <Avatar>
                    <AvatarImage
                      src={parentOwner?.avatar || ""}
                      alt={parentOwner?.name || ""}
                    />
                    <AvatarFallback>
                      {parentOwner?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mt-1 w-0.5 grow bg-gray-300" />
                </div>
                <div className="flex flex-col justify-center pb-3 text-sm">
                  <div className="mb-0.5 flex items-start justify-between">
                    <div className="flex gap-1">
                      <span className="font-semibold">{parentOwner?.name}</span>
                      <span className="text-gray-500">
                        @{parentOwner?.username}
                      </span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500">
                        {parent?.createdAt.toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </div>
                  <p className="break-words">{parent?.content}</p>
                </div>
              </div>
            </div>
            <div className="flex min-h-3 px-4">
              <div className="mr-2 flex basis-10 flex-col items-center">
                <div className="mb-1 w-0.5 grow bg-gray-300" />
              </div>
              <p className="grow pb-4 pt-1 text-sm text-gray-500">
                Replying to
                <span className="text-blue-500">
                  {parentMentions
                    ?.map((mention) => ` @${mention?.username}`)
                    .join("")}
                </span>
              </p>
            </div>
          </div>
          <PostCreate
            parentId={parent?.postId}
            afterSubmit={() => setOpen(false)}
            minRows={3}
          />
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default ReplyModal;
