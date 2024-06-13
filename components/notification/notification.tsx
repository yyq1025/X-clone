import Post from "@/components/post/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Name from "@/components/user/name";
import UserAvatar from "@/components/user/user-avatar";
import UserCard from "@/components/user/user-card";
import { useNotificationById } from "@/lib/hooks/useNotification";
import { usePostById } from "@/lib/hooks/usePost";
import { useUserById } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import { HeartIcon, UserIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface NotificationProps {
  notificationId?: number;
}

const Notification: FC<NotificationProps> = ({ notificationId }) => {
  const router = useRouter();
  const { data: notification } = useNotificationById(notificationId);
  const { data: sender } = useUserById(notification?.sender_id);
  const { data: recipient } = useUserById(notification?.recipient_id);
  const { data: post, isLoading } = usePostById(notification?.post_id);

  if (!isLoading && !post) return null;

  return (
    <>
      {notification?.type === "reply" && (
        <Post
          postId={notification?.post_id}
          mode="withReplyTo"
          className={cn("border-b", !notification?.read && "bg-primary/10")}
        />
      )}
      {notification?.type === "like" && (
        <div
          onClick={() =>
            router.push(`/${recipient?.username}/status/${post?.id}`, {
              scroll: false,
            })
          }
          className={cn(
            "flex cursor-pointer border-b px-4 py-3 text-sm transition-colors hover:bg-accent",
            !notification?.read && "bg-primary/10",
          )}
        >
          <div className="mr-2 flex basis-10 flex-col items-end">
            <HeartIcon className="size-8 text-red-500" />
          </div>
          <div className="flex grow flex-col">
            <div className="mb-3 flex">
              <UserCard uid={sender?.id}>
                <UserAvatar uid={sender?.id} className="size-8" />
              </UserCard>
            </div>
            <div>
              <UserCard uid={sender?.id}>
                <Name uid={sender?.id} />
              </UserCard>{" "}
              liked your {post?.parent_id ? "reply" : "post"}
            </div>
            <p className="mt-3 text-gray-500">{post?.content}</p>
          </div>
        </div>
      )}
      {notification?.type === "follow" && (
        <div
          onClick={() => router.push(`/${sender?.username}`, { scroll: false })}
          className={cn(
            "flex cursor-pointer border-b px-4 py-3 text-sm transition-colors hover:bg-accent",
            !notification?.read && "bg-primary/10",
          )}
        >
          <div className="mr-2 flex basis-10 flex-col items-end">
            <UserIcon className="size-8 text-primary" />
          </div>
          <div className="flex grow flex-col">
            <div className="mb-3 flex">
              <UserCard uid={sender?.id}>
                <UserAvatar uid={sender?.id} className="size-8" />
              </UserCard>
            </div>
            <div>
              <UserCard uid={sender?.id}>
                <Name uid={sender?.id} />
              </UserCard>{" "}
              followed you
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
