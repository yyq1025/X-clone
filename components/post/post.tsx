import BookmarkButton from "@/components/post/bookmark-button";
import LikeButton from "@/components/post/like-button";
import MoreButton from "@/components/post/more-button";
import ReplyButton from "@/components/post/reply-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Name from "@/components/user/name";
import UserAvatar from "@/components/user/user-avatar";
import UserCard from "@/components/user/user-card";
import Username from "@/components/user/username";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface PostProps {
  className?: string;
  mode?: "withReplyTo" | "status" | "default";
  postId?: number | null;
}

const Post: FC<PostProps> = ({ className, mode = "default", postId }) => {
  const { data: post } = usePostById(postId);
  const { data: owner } = useUserById(post?.owner_id);
  const { data: parent } = usePostById(post?.parent_id);
  const router = useRouter();

  if (mode != "status" && post?.deleted) return null;

  return (
    <div
      onClick={() =>
        !post?.deleted &&
        router.push(`/${owner?.username}/status/${post?.id}`, {
          scroll: false,
        })
      }
      className={cn(
        "flex flex-col items-stretch px-4 text-sm text-gray-500 transition-colors",
        !post?.deleted && "cursor-pointer hover:bg-accent",
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
      {post?.deleted ? (
        <Alert className="mb-3 bg-secondary text-gray-600">
          <AlertDescription>
            This Post was deleted by the Post author.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex">
          <div className="mr-2 flex basis-10 flex-col items-center">
            <UserCard uid={owner?.id}>
              <UserAvatar uid={owner?.id} className="size-10" />
            </UserCard>
            {mode === "status" && (
              <div className="mx-auto mt-1 w-0.5 grow bg-gray-300" />
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center pb-3">
            <div className="mb-0.5 flex items-center justify-between">
              <div className="flex gap-1">
                <UserCard uid={owner?.id}>
                  <Name uid={owner?.id} />
                </UserCard>
                <UserCard uid={owner?.id}>
                  <Username uid={owner?.id} />
                </UserCard>
                <span>·</span>
                <span>{dayjs(post?.created_at).format("MMM DD")}</span>
              </div>
              <MoreButton postId={post?.id} />
            </div>
            {mode === "withReplyTo" && !!post?.parent_id && (
              <p className="mb-0.5">
                Replying to{" "}
                {parent?.mentions.map((uid) => (
                  <>
                    <UserCard uid={uid}>
                      <Username
                        uid={uid}
                        className="text-primary hover:underline"
                      />
                    </UserCard>{" "}
                  </>
                ))}
              </p>
            )}
            <p className="text-foreground">{post?.content}</p>
            <div className="mt-3 flex items-center justify-between gap-1 text-gray-600">
              <div className="flex-start flex flex-1">
                <ReplyButton postId={post?.id} className="size-5" />
              </div>
              <div className="flex-start flex flex-1">
                <LikeButton postId={post?.id} className="size-5" />
              </div>
              <div className="flex-start flex flex-1">
                <BookmarkButton postId={post?.id} className="size-5" />
              </div>
              <div className="flex-start flex">
                <Button variant="ghost" size="sm" className="-m-2 h-auto p-2">
                  <ArrowUpTrayIcon className="size-5 stroke-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
