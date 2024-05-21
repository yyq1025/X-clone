import Like from "@/components/post/like";
import ReplyModal from "@/components/post/reply-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import type { Post } from "@prisma/client";
import { Bookmark, Ellipsis, Heart, MessageSquare, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface PostProps {
  className?: string;
  mode?: "reply" | "status" | "home";
  postId: string;
}

const Post: FC<PostProps> = ({ className, mode = "home", postId }) => {
  const router = useRouter();

  const { data: post } = usePostById(postId);
  const { data: ownerData } = useUserById(post?.ownerId);
  const { data: parent } = usePostById(post?.parentId);
  const { users: parentMentions } = useUsersByIds(parent?.mentions);

  return (
    <>
      <div
        className={cn(
          "flex cursor-pointer flex-col items-stretch px-4 text-sm",
          className,
        )}
        onClick={() => router.push(`/${post?.ownerId}/status/${post?.postId}`)}
      >
        <div className="flex">
          {mode === "status" && post?.parentId && (
            <div className="relative mb-1 mr-2 flex basis-10 flex-col">
              <div className="absolute inset-0 mx-auto w-0.5 bg-gray-300" />
            </div>
          )}
          <div className="grow pt-3" />
        </div>
        <div className="flex">
          <div className="mr-2 flex basis-10 flex-col items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={ownerData?.avatar || ""}
                alt={ownerData?.name || ""}
              />
              <AvatarFallback>
                {ownerData?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {mode === "status" && (
              <div className="mx-auto mt-1 w-0.5 grow bg-gray-300" />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center pb-1">
            <div className="mb-0.5 flex items-start justify-between">
              <div className="flex gap-1">
                <span className="font-semibold">{ownerData?.name}</span>
                <span className="text-gray-500">@{ownerData?.username}</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {post?.createdAt.toLocaleDateString("en-US")}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 px-3">
                <Ellipsis size={16} />
              </Button>
            </div>
            {mode === "reply" && parent && (
              <p className="mb-0.5 text-sm text-gray-500">
                Replying to
                <span className="text-blue-500">
                  {parentMentions.map((mention) => ` @${mention?.username}`)}
                </span>
              </p>
            )}
            <p>{post?.content}</p>
            <div className="mt-1 flex items-center justify-between gap-1 text-gray-500">
              <div className="flex-start flex flex-1">
                <ReplyModal
                  postId={post?.postId}
                  renderTrigger={({ buttonProps, repliesCount }) => (
                    <Button
                      {...buttonProps}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <MessageSquare size={16} />
                      <span className="text-sm">
                        {!!repliesCount && repliesCount}
                      </span>
                    </Button>
                  )}
                />
              </div>
              <div className="flex-start flex flex-1">
                <Like
                  postId={post?.postId}
                  render={({ buttonProps, liked, likesCount }) => (
                    <Button
                      {...buttonProps}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "gap-1",
                        liked && "text-red-500 hover:text-red-500",
                      )}
                    >
                      <Heart
                        size={16}
                        className={cn(liked && "fill-red-500")}
                      />
                      {!!likesCount && (
                        <span className="text-sm">{likesCount}</span>
                      )}
                    </Button>
                  )}
                />
              </div>
              <div className="flex-start flex flex-1">
                <Button variant="ghost" size="sm">
                  <Bookmark size={16} />
                </Button>
              </div>
              <div className="flex-start flex">
                <Button variant="ghost" size="sm">
                  <Share size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
