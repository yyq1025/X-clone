"use client";

import PostCreate from "@/components/post/post-create";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { usePostModalStore } from "@/lib/stores/postModal";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Content } from "@radix-ui/react-dialog";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function PostModal() {
  const { parentId, setParentId } = usePostModalStore();

  const router = useRouter();

  const { data: parent } = usePostById(parentId);
  const { data: parentOwner } = useUserById(parent?.owner_id);
  const { users: parentMentions } = useUsersByIds(parent?.mentions);

  const handleClose = () => {
    setParentId(null);
    history.length > 1
      ? router.back()
      : router.push("/home", { scroll: false });
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40" />
        <Content className="fixed left-[50%] top-[5%] z-50 flex min-w-[600px] -translate-x-[50%] flex-col rounded-xl bg-background">
          <div className="flex h-[53px] w-full items-center px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="-m-2 h-auto p-2"
            >
              <XMarkIcon className="size-5 stroke-2" />
            </Button>
          </div>
          {parent?.id && (
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
                        <span className="font-semibold">
                          {parentOwner?.name}
                        </span>
                        <span className="text-gray-500">
                          @{parentOwner?.username}
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500">
                          {dayjs(parent?.created_at).format("MMM DD")}
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
                  <span className="text-primary">
                    {parentMentions
                      ?.map((mention) => ` @${mention?.username}`)
                      .join("")}
                  </span>
                </p>
              </div>
            </div>
          )}
          <PostCreate
            parentId={parent?.id}
            afterSubmit={handleClose}
            minRows={3}
          />
        </Content>
      </DialogPortal>
    </Dialog>
  );
}
