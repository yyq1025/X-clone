import BookmarkButton from "@/components/post/bookmark-button";
import LikeButton from "@/components/post/like-button";
import MoreButton from "@/components/post/more-button";
import ReplyButton from "@/components/post/reply-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById, useUsersByIds } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Ellipsis, Share } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

interface PostProps {
  className?: string;
  mode?: "withReplyTo" | "status" | "default";
  postId?: number | null;
}

const Post: FC<PostProps> = ({ className, mode = "default", postId }) => {
  const { data: post, isLoading } = usePostById(postId);
  const { data: ownerData } = useUserById(post?.owner_id);
  const { data: parent } = usePostById(post?.parent_id);
  const { users: parentMentions } = useUsersByIds(parent?.mentions);

  if (!isLoading && !post) return null;

  return (
    <Link
      href={`/${ownerData?.username}/status/${post?.id}`}
      scroll={false}
      className={cn(
        "flex flex-col items-stretch px-4 text-sm text-gray-500 transition-colors hover:bg-accent",
        className,
      )}
    >
      <div className="flex">
        {mode === "status" && !!post?.parent_id && (
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
        <div className="flex flex-1 flex-col justify-center pb-3">
          <div className="mb-0.5 flex items-center justify-between">
            <div className="flex gap-1">
              <span className="font-semibold text-foreground">
                {ownerData?.name}
              </span>
              <span>@{ownerData?.username}</span>
              <span>·</span>
              <span>{dayjs(post?.created_at).format("MMM DD")}</span>
            </div>
            <MoreButton postId={post?.id} />
          </div>
          {mode === "withReplyTo" && parent && (
            <p className="mb-0.5">
              Replying to
              <span className="text-blue-500">
                {parentMentions.map((mention) => ` @${mention?.username}`)}
              </span>
            </p>
          )}
          <p className="text-foreground">{post?.content}</p>
          <div className="mt-3 flex items-center justify-between gap-1">
            <div className="flex-start flex flex-1">
              <ReplyButton postId={post?.id} size={16} />
            </div>
            <div className="flex-start flex flex-1">
              <LikeButton postId={post?.id} size={16} />
            </div>
            <div className="flex-start flex flex-1">
              <BookmarkButton postId={post?.id} size={16} />
            </div>
            <div className="flex-start flex">
              <Button variant="ghost" size="sm" className="-m-2 h-8 p-2">
                <Share size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Post;
